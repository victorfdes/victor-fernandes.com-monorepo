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
    <div className="flex flex-col gap-5">
      <h3 className="eyebrow m-0 pb-0">Education</h3>
      {education.map((item) => {
        const logo = INSTITUTION_LOGOS[item.institution]
        return (
          <div className="border-line flex flex-col gap-3 border-t pt-5" key={item.institution}>
            <p className="text-ink m-0 text-base font-light leading-snug">{item.degree}</p>
            <div className="flex items-center gap-3">
              {logo && (
                <img
                  src={logo}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="border-line size-10 shrink-0 rounded-full border bg-white object-contain p-1"
                />
              )}
              <div className="min-w-0">
                <p className="text-ink-3 m-0 text-sm">{item.institution}</p>
                <p className="text-ink-4 m-0 mt-0.5 text-[0.8125rem]">
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
