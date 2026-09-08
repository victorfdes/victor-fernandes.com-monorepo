import { clsx } from "clsx"
import type { SkillSection } from "components/resume/_data/schema"

type SkillsSidebarProps = {
  readonly sections: readonly SkillSection[]
  readonly className?: string
}

export function SkillsSidebar({ sections, className = "" }: Readonly<SkillsSidebarProps>) {
  return (
    <section className={clsx("w-full", className)} aria-labelledby="skills-heading">
      <h3 id="skills-heading" className="eyebrow m-0 pb-0">
        Skills
      </h3>

      <div className="mt-5 flex flex-col">
        {sections.map((section) => (
          <div key={section.id} className="border-line border-t py-5">
            <h4 className="text-ink m-0 pb-0 text-sm font-normal normal-case">{section.title}</h4>
            {section.badges.length ? (
              <ul className="mt-3.5 flex flex-wrap gap-2 pl-0" aria-label={`Skills for ${section.title}`}>
                {section.badges.map((badge) => (
                  <li key={badge} className="tag list-none">
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
