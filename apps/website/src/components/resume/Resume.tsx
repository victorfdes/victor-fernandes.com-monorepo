import type { Experience } from "components/resume/_data/schema"
import SectionHead from "components/SectionHead"
import type { CSSProperties } from "react"
import { companyAccent, COMPANY_DATA } from "utils/companies"
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

/**
 * One hairline row per role: the company, title, dates and tags in the narrow column, the
 * achievements in the wide one. Each bullet opens with a short rule rather than a disc — the
 * same dash the rest of the system uses, and it keeps a long wrapped bullet visually hung.
 */
const Resume = ({
  experience,
  heading = "Experience",
  index,
}: Readonly<{
  experience: readonly Experience[]
  heading?: string | undefined
  index?: string | undefined
}>) => {
  return (
    <section className="section" aria-labelledby="experience">
      <SectionHead index={index} id="experience">
        {heading}
      </SectionHead>

      <div className="grid">
        {experience.map((exp, position) => {
          const companyKey = resolveCompanyKey(exp.id)
          const company = companyKey ? COMPANY_DATA[companyKey] : undefined
          const accent = company ? companyAccent(company) : undefined

          return (
            <article
              key={exp.id}
              className={`rule-row split gap-y-6 ${position === experience.length - 1 ? "border-line border-b" : ""}`}
            >
              <header className="split-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {accent && (
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                  )}
                  {/* Masked, so the mark takes the page's ink instead of the brand's own colours. */}
                  {company?.logo ? (
                    <h3
                      className="wordmark text-ink m-0 h-6 max-w-32 pb-0"
                      style={{ "--wordmark": `url("${company.logo}")` } as CSSProperties}
                    >
                      <span className="sr-only">{exp.company}</span>
                    </h3>
                  ) : (
                    <h3 className="text-ink m-0 pb-0 text-xl font-light uppercase leading-tight lg:text-2xl">
                      {exp.company}
                    </h3>
                  )}
                </div>

                <p className="text-accent m-0 text-[0.9375rem] tracking-wide">{exp.role}</p>
                <p className="meta m-0 tabular-nums">
                  {exp.startDate} — {exp.endDate}
                </p>
                {exp.location && <p className="text-ink-4 m-0 text-[0.8125rem]">{exp.location}</p>}

                {exp.tags.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-2 pl-0">
                    {exp.tags.map((tag) => (
                      <li key={tag} className="tag list-none">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </header>

              <ul className="split-8 m-0 grid gap-4 pl-0">
                {exp.bullets.map((bullet) => (
                  <li key={bullet} className="flex list-none gap-4">
                    <span aria-hidden="true" className="rule-dash" />
                    <p className="text-ink m-0 text-pretty text-base font-light leading-relaxed lg:text-lg">
                      {renderInlineMarkdown(bullet)}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Resume
