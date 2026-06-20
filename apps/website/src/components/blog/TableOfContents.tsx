"use client"

import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import type { BlogHeading } from "utils/blog-content"

export function TableOfContents({
  headings,
  className,
  autoScroll = false,
}: Readonly<{
  headings: BlogHeading[]
  className?: string
  autoScroll?: boolean
}>) {
  const [activeId, setActiveId] = useState(headings[0]?.id)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const sections = headings.map((heading) => document.getElementById(heading.id)).filter(Boolean) as HTMLElement[]

    if (sections.length === 0) {
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-18% 0px -68%", threshold: [0, 1] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [headings])

  // Keep the active entry centred within the besides-post TOC as the reader scrolls.
  // Driven by `activeId` (set by the observer above), so there is no per-frame work.
  useEffect(() => {
    if (!autoScroll || !activeId) {
      return
    }

    const container = navRef.current
    // jsdom has no layout engine or `scrollTo`; guarding keeps tests and SSR fallbacks safe.
    if (!container || typeof container.scrollTo !== "function") {
      return
    }

    const item = container.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`)
    if (!item) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const target =
      container.scrollTop + (itemRect.top - containerRect.top) - container.clientHeight / 2 + itemRect.height / 2

    const reduceMotion =
      typeof globalThis.matchMedia === "function" && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches

    // `scrollTo` clamps to [0, scrollHeight - clientHeight], so the first/last entries and a
    // list that fits without overflowing all resolve without any extra edge-case branching.
    container.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" })
  }, [activeId, autoScroll])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav
      ref={navRef}
      aria-label="Article sections"
      className={clsx(
        "shadow-hover-box",
        autoScroll && "scrollbar-none max-h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <h2 className="pb-0 text-sm font-semibold uppercase tracking-normal">On this page</h2>
      <ol className="mt-4 space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} data-toc-id={heading.id} className={clsx(heading.level === 3 && "pl-4")}>
            <a
              href={`#${heading.id}`}
              className={clsx(
                "block border-l-2 py-1 pl-3 no-underline transition",
                activeId === heading.id
                  ? "border-cyan-500 text-cyan-700 dark:text-cyan-300"
                  : "border-transparent hover:border-zinc-400"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
