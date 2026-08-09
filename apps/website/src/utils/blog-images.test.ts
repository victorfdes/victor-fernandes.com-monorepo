import { getImage } from "astro:assets"
import { BLOG_IMAGE_SIZES, blogCardImage, blogImage } from "utils/blog-images"

// `astro:assets` is a build-only virtual module, aliased to a test stub in vitest.config.ts. In a real
// build `getImage` fetches the original and runs Sharp; here it is driven by hand.
const mockedGetImage = vi.mocked(getImage)

const CDN_SRC = "https://cdn.test.example/images/hero.jpg"

/**
 * `getImage` is called twice per image: once with `inferSize` to probe the original's dimensions, then
 * once with the resolved widths to emit the variants. Reply to the probe with the source's intrinsic
 * size, and to the emit call with an echo of the widths it was asked for.
 */
const stubGetImage = ({ width, height }: { width: number; height: number }) => {
  mockedGetImage.mockImplementation(((options: { widths?: number[] }) => {
    if (!options.widths) return Promise.resolve({ rawOptions: { width, height } })
    return Promise.resolve({
      src: "/_astro/hero_default.webp",
      srcSet: {
        attribute: options.widths.map((w) => `/_astro/hero_${w}.webp ${w}w`).join(", "),
      },
    })
  }) as unknown as typeof getImage)
}

/** The `widths` array the second (emitting) `getImage` call received. */
const emittedWidths = () =>
  mockedGetImage.mock.calls.map(([options]) => (options as { widths?: number[] }).widths).find(Boolean)

beforeEach(() => {
  mockedGetImage.mockReset()
})

describe("blogImage", () => {
  it("emits pre-resized same-origin variants rather than on-the-fly CDN transforms", async () => {
    stubGetImage({ width: 2400, height: 1260 })

    const { src, srcSet, sizes } = await blogImage(CDN_SRC)

    expect(src).toBe("/_astro/hero_default.webp")
    expect(sizes).toBe(BLOG_IMAGE_SIZES)
    expect(srcSet).not.toContain("cdn-cgi/image")
    expect(srcSet).toContain("/_astro/hero_400.webp 400w")
    expect(srcSet).toContain("/_astro/hero_1920.webp 1920w")
  })

  it("requests the default candidate at 800px, not the full original", async () => {
    stubGetImage({ width: 2400, height: 1260 })

    await blogImage(CDN_SRC)

    const emitCall = mockedGetImage.mock.calls.map(([options]) => options).find((options) => "widths" in options)
    expect(emitCall).toMatchObject({ width: 800, height: 420, format: "webp", quality: 80 })
  })

  it("clamps candidates to the source width so Sharp never upscales", async () => {
    // Today's originals are 1731px wide — narrower than the 1920 candidate.
    stubGetImage({ width: 1731, height: 909 })

    await blogImage(CDN_SRC)

    expect(emittedWidths()).toEqual([400, 640, 800, 1080, 1280, 1731])
  })

  it("leaves candidates untouched when the source is wide enough", async () => {
    stubGetImage({ width: 3000, height: 1575 })

    await blogImage(CDN_SRC)

    expect(emittedWidths()).toEqual([400, 640, 800, 1080, 1280, 1920])
  })

  it("does not duplicate a candidate that already equals the source width", async () => {
    stubGetImage({ width: 1280, height: 672 })

    await blogImage(CDN_SRC)

    expect(emittedWidths()).toEqual([400, 640, 800, 1080, 1280])
  })

  it("passes through sources outside the CDN origin without resizing them", async () => {
    const { src, srcSet, sizes } = await blogImage("https://elsewhere.example/hero.jpg")

    expect(src).toBe("https://elsewhere.example/hero.jpg")
    expect(srcSet).toBeUndefined()
    expect(sizes).toBe(BLOG_IMAGE_SIZES)
    expect(mockedGetImage).not.toHaveBeenCalled()
  })

  it("omits srcset rather than emitting an empty attribute", async () => {
    mockedGetImage.mockImplementation(((options: { widths?: number[] }) =>
      Promise.resolve(
        options.widths
          ? { src: "/_astro/hero_default.webp", srcSet: { attribute: "" } }
          : { rawOptions: { width: 2400, height: 1260 } }
      )) as unknown as typeof getImage)

    const { src, srcSet } = await blogImage(CDN_SRC)

    expect(src).toBe("/_astro/hero_default.webp")
    expect(srcSet).toBeUndefined()
  })

  it("serves the original when the probe cannot determine intrinsic dimensions", async () => {
    mockedGetImage.mockResolvedValue({ rawOptions: {} } as unknown as Awaited<ReturnType<typeof getImage>>)

    const { src, srcSet } = await blogImage(CDN_SRC)

    expect(src).toBe(CDN_SRC)
    expect(srcSet).toBeUndefined()
    expect(mockedGetImage).toHaveBeenCalledTimes(1)
  })
})

describe("blogCardImage", () => {
  it("uses the narrow card candidates, not the hero set", async () => {
    stubGetImage({ width: 1731, height: 909 })

    const { src, srcSet, sizes } = await blogCardImage(CDN_SRC)

    expect(src).toBe("/_astro/hero_default.webp")
    expect(sizes).toBe("(min-width: 448px) 320px, calc(100vw - 128px)")
    expect(emittedWidths()).toEqual([240, 320])
    expect(srcSet).toContain("/_astro/hero_240.webp 240w")
    expect(srcSet).not.toContain("640w")
  })
})
