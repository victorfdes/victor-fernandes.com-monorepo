export type Company = {
  key: string
  name: string
  logo: string
}

export type ExperienceMeta = {
  title: string
  dates: string // keep as pre-formatted string for full control (e.g., "Mar 2023 – Present")
  employmentType?: string // "Contract", "Full-time", etc.
  location?: string // optional
}

export type ExperienceMetaMap = Record<string, ExperienceMeta>

export type ResumeItem = {
  company: Company
  detail: React.ReactNode
}
