import { clsx } from "clsx"
import type { SkillSection } from "components/resume/_data/schema"

type SkillsSidebarProps = {
  readonly sections: readonly SkillSection[]
  readonly className?: string
}

export function SkillsSidebar({ sections, className = "" }: Readonly<SkillsSidebarProps>) {
  return (
    <section className={clsx("w-full", className)} aria-labelledby="skills-heading">
      <h3 id="skills-heading">Skills</h3>

      <div className="flex flex-col">
        {sections.map((section) => (
          <div key={section.id} className="relative">
            <div className="mb-4 mt-6 flex items-center gap-2">
              <h4 className="text-sm">{section.title}</h4>
            </div>
            {section.badges.length ? (
              <ul className="flex flex-wrap gap-1.5" aria-label={`Skills for ${section.title}`}>
                {section.badges.map((badge) => (
                  <li key={badge} className="chip-base">
                    {badge}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
