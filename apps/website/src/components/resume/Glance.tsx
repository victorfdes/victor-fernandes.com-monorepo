import type { GlanceItem } from "components/resume/_data/schema"
import { renderInlineMarkdown } from "utils/renderInlineMarkdown"

interface GlanceProps {
  readonly glance: Record<string, GlanceItem>
  readonly className?: string
}

export default function Glance({ glance, className }: Readonly<GlanceProps>) {
  const entries = Object.entries(glance)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value)

  return (
    <section className={className}>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-8 text-sm md:grid-cols-3">
          {entries.map((entry) => (
            <article key={entry.title} className="space-y-1">
              <h3 className="my-4 text-sm">{entry.title}</h3>
              <ul className="list-disc space-y-1 pl-4">
                {entry.details.map((detail) => (
                  <li key={detail}>{renderInlineMarkdown(detail)}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
