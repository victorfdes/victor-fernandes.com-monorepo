import { SmartLink } from "@repo/ui"
import type { CSSProperties } from "react"
import { companyAccent, getCompanyData } from "../utils/companies"
import { LINKS } from "../utils/links"
import PageHero from "./PageHero"
import SectionHead from "./SectionHead"

const SCALE_INFO = [
  {
    company: "UPWORK",
    items: [
      {
        id: "messaging",
        content: (
          <>
            Real-time messaging and collaboration tools impacting <strong className="font-semibold">20M+ users</strong>.
          </>
        ),
      },
      {
        id: "micro-frontends",
        content: (
          <>
            Scaled cross-team development via <strong className="font-semibold">micro-frontends</strong>.
          </>
        ),
      },
    ],
  },
  {
    company: "CLEVERTAP",
    items: [
      {
        id: "sdk",
        content: (
          <>
            Open-source SDK with <strong className="font-semibold">25k+ weekly downloads</strong>.
          </>
        ),
      },
      {
        id: "dashboards",
        content: (
          <>
            Built Vue-based SaaS dashboards for{" "}
            <strong className="font-semibold">real-time user behavioral analytics</strong>.
          </>
        ),
      },
    ],
  },
  {
    company: "MEDIA_NET",
    items: [
      {
        id: "push-notifications",
        content: (
          <>
            Full-stack push notification system with <strong className="font-semibold">100K+ subscribers</strong>.
          </>
        ),
      },
      {
        id: "analytics",
        content: (
          <>
            Dashboard to analyze <strong className="font-semibold">gigabytes</strong> of daily analytics data.
          </>
        ),
      },
    ],
  },
]

const HeaderBanner = () => {
  return (
    <>
      <PageHero
        lead="Victor"
        emphasis="Fernandes"
        tagline={
          <>
            Building <span className="text-accent">performant</span> frontends at{" "}
            <span className="text-accent">scale</span>
          </>
        }
        aside={
          <p className="lede m-0">
            I'm a software engineer with 12+ years of experience building secure, reliable, and high-performance web
            applications. Across roles at Media.net, CleverTap, and Upwork, I've developed a product mindset centered on
            scale, accessibility, and resilience.
          </p>
        }
      />

      <section className="section" aria-labelledby="worked-with">
        <SectionHead index="01" id="worked-with">
          Having worked with
        </SectionHead>

        {/*
          One hairline row per company rather than a card each: the wordmark is a mask in the
          page's own ink, so the row reads as a single band of the site instead of three brand
          palettes shouting over one another. The dot is the only place each brand keeps its hue.
        */}
        <div className="grid">
          {SCALE_INFO.map(({ company, items }) => {
            const data = getCompanyData(company)
            if (!data) return null
            const accent = companyAccent(data)

            return (
              <article key={company} className="rule-row split gap-y-5">
                <div className="split-4 flex items-center gap-4">
                  {accent && (
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                  )}
                  {/*
                    The logo paints as a CSS mask, so the company name is carried by
                    visually-hidden text rather than `alt` — masking never touches the
                    accessibility tree, so the name stays real text there.
                  */}
                  <span className="wordmark text-ink" style={{ "--wordmark": `url("${data.logo}")` } as CSSProperties}>
                    <span className="sr-only">{data.name}</span>
                  </span>
                </div>

                <div className="split-8 grid gap-4">
                  {items.map((item) => (
                    <p key={item.id} className="text-ink m-0 text-pretty text-lg font-light leading-snug">
                      {item.content}
                    </p>
                  ))}
                </div>
              </article>
            )
          })}

          {/* Same row shape, no wordmark — the run closes with a bottom rule. */}
          <article className="rule-row split border-line gap-y-5 border-b">
            <h3 className="split-4 meta m-0 pb-0">More</h3>
            <div className="split-8 grid gap-4">
              <p className="text-ink m-0 text-pretty text-lg font-light leading-snug">
                There's more to my work than these selected highlights.
              </p>
              <SmartLink href={LINKS.RESUME} className="cta-rule w-fit">
                View resume
              </SmartLink>
            </div>
          </article>
        </div>

        <div className="split gap-y-0 pt-10">
          <div className="split-4" />
          <p className="lede split-8 m-0 max-w-[58ch]">
            My focus areas include website performance optimization, application hardening, and single-page
            applications. You can learn more about my career on{" "}
            <SmartLink href={LINKS.LINKEDIN} showExternalIcon>
              LinkedIn
            </SmartLink>{" "}
            and explore selected source-available work on{" "}
            <SmartLink href={LINKS.GITHUB} showExternalIcon>
              GitHub
            </SmartLink>
            .
          </p>
        </div>
      </section>
    </>
  )
}

export default HeaderBanner
