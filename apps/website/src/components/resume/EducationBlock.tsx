import type { Education } from "components/resume/_data/schema"
import { cdnUrl } from "utils/cdn"

const INSTITUTION_LOGOS: Record<string, string> = {
  "St Francis Institute of Technology": cdnUrl("images/48/sfit.png"),
}

type EducationBlockProps = {
  readonly education: readonly Education[]
}

const EducationBlock = ({ education }: Readonly<EducationBlockProps>) => {
  return (
    <div className="mt-8 flex flex-col gap-2">
      <h3>Education</h3>
      {education.map((item) => {
        const logo = INSTITUTION_LOGOS[item.institution]
        return (
          <div className="mt-4 flex flex-col gap-2" key={item.institution}>
            <p className="text-lg">{item.degree}</p>
            <div className="flex gap-2">
              {logo && (
                <div className="h-12 w-12 shrink-0 rounded bg-white p-1">
                  <img src={logo} alt={`${item.institution} logo`} className="h-full w-full object-contain" />
                </div>
              )}
              <div>
                <p className="secondary-text text-sm">{item.institution}</p>
                <p className="secondary-text mt-0 text-sm">
                  {item.location} · {item.graduationDate}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default EducationBlock
