const PUBLICATIONS = [
  "Personalized Cued Click Points to overcome the limitations of Persuasive Cued Click Points",
  "Implementation and Evaluation of Personalized Persuasive Cued Click Points",
]

const JOURNAL = "The International Journal Of Science & Technoledge"
const ISSN = "(ISSN 2321 / 919X)"

const Publications = () => {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="eyebrow m-0 pb-0">Publications</h3>
      {PUBLICATIONS.map((title) => (
        <div key={title} className="border-line border-t pt-5">
          <p className="text-ink m-0 text-base font-light leading-snug">{title}</p>
          <p className="text-ink-3 m-0 mt-2 text-sm">{JOURNAL}</p>
          <p className="text-ink-4 m-0 text-[0.8125rem] tabular-nums">{ISSN}</p>
        </div>
      ))}
    </div>
  )
}

export default Publications
