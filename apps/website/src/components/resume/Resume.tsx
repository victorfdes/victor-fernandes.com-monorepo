"use client"

import type { Experience } from "components/resume/_data/schema"
import { COMPANY_DATA } from "utils/companies"
import { renderInlineMarkdown } from "utils/renderInlineMarkdown"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map experience id → COMPANY_DATA key (uppercased, hyphens → underscores) */
function resolveCompanyKey(id: string): keyof typeof COMPANY_DATA | undefined {
  const normalised = id.toUpperCase().replaceAll("-", "_")
  if (normalised in COMPANY_DATA) return normalised as keyof typeof COMPANY_DATA

  // For composite ids like "upwork-freelance", try the first segment.
  const prefix = id.split("-")[0]?.toUpperCase()
  if (prefix && prefix in COMPANY_DATA) return prefix as keyof typeof COMPANY_DATA

  return undefined
}

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

const Resume = ({
  experience,
  heading = "Fulltime Experience",
  className,
}: Readonly<{
  experience: readonly Experience[]
  heading?: string
  className?: string
}>) => {
  return (
    <section className={cx("w-full", className)} aria-label={heading}>
      <div className="flex items-end justify-between gap-4">
        <h3>{heading}</h3>
      </div>

      <div className="mt-4 space-y-4">
        {experience.map((exp) => {
          const companyKey = resolveCompanyKey(exp.id)
          const company = companyKey ? COMPANY_DATA[companyKey] : undefined
          const hasLogo = !!company?.logo

          return (
            <article key={exp.id} className="border-color mt-8 border-b pb-8 last:border-b-0">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  {hasLogo && (
                    <div className="relative h-10 w-20 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={company.logo}
                        alt={`${exp.company} logo`}
                        className="h-full w-full object-contain p-1.5 dark:brightness-0 dark:invert"
                      />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50 print:text-black">
                        {exp.company}
                      </h3>
                    </div>

                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{exp.role}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {exp.startDate} - {exp.endDate}
                  </div>
                  {exp.location && <div className="text-xs text-zinc-500 dark:text-zinc-400">{exp.location}</div>}
                </div>
              </header>

              <div className="mt-4 border-zinc-100 pt-4 dark:border-zinc-900">
                <ul className="list-disc space-y-2 pl-5">
                  {exp.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm">
                      {renderInlineMarkdown(bullet)}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Resume
