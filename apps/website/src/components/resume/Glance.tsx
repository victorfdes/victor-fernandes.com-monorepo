import type { GlanceItem } from "components/resume/_data/schema"
import SectionHead from "components/SectionHead"
import { renderInlineMarkdown } from "utils/renderInlineMarkdown"

interface GlanceProps {
  readonly glance: Record<string, GlanceItem>
  readonly index?: string | undefined
}

// Roman numerals, matching the home page's method blocks: the arabic index belongs to the
// section, these belong to the items inside it, and the two registers keep that clear.
const NUMERALS = ["I", "II", "III", "IV", "V", "VI"]

export default function Glance({ glance, index }: Readonly<GlanceProps>) {
  const entries = Object.entries(glance)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value)

  return (
    <section className="section" aria-labelledby="at-a-glance">
      <SectionHead index={index} id="at-a-glance">
        At a glance
      </SectionHead>

      <div className="rule-grid">
        {entries.map((entry, position) => (
          <article key={entry.title} className="flex gap-5">
            <span aria-hidden="true" className="text-accent w-7 shrink-0 pt-1.5 text-xs tabular-nums tracking-[0.2em]">
              {NUMERALS[position] ?? ""}
            </span>
            <div className="min-w-0">
              <h3 className="text-ink m-0 pb-0 text-xl font-light leading-snug lg:text-[1.375rem]">{entry.title}</h3>
              <div className="mt-4 grid gap-3.5">
                {entry.details.map((detail) => (
                  <p key={detail} className="lede m-0 text-[1.0625rem]">
                    {renderInlineMarkdown(detail)}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
