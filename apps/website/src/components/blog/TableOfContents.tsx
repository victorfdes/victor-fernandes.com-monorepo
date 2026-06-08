"use client"

import clsx from "clsx"
import { useEffect, useState } from "react"
import type { BlogHeading } from "utils/blog-content"

export function TableOfContents({
  headings,
  className,
}: Readonly<{
  headings: BlogHeading[]
  className?: string
}>) {
  const [activeId, setActiveId] = useState(headings[0]?.id)

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

  if (headings.length === 0) {
    return null
  }

  return (
    <nav aria-label="Article sections" className={clsx("border-color rounded-lg border p-4", className)}>
      <h2 className="pb-0 text-sm font-semibold uppercase tracking-normal">On this page</h2>
      <ol className="mt-4 space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={clsx(heading.level === 3 && "pl-4")}>
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
