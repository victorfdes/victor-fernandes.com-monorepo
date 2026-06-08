import { z } from "zod"

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const ContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  headline: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  location: z.string(),
  website: z.string(),
  linkedIn: z.string(),
  github: z.string(),
})

const SkillSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  badges: z.array(z.string().min(1)).min(1),
})

const ExperienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string(),
  tags: z.array(z.string()).default([]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
})

const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  location: z.string(),
  graduationDate: z.string().min(1),
})

const GlanceItemSchema = z.object({
  title: z.string().min(1),
  details: z.array(z.string().min(1)).min(1),
})

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const ResumeSchema = z.object({
  contact: ContactSchema,
  summary: z.string().min(1),
  skillsSections: z.array(SkillSectionSchema).min(1),
  experience: z.array(ExperienceSchema).min(1),
  education: z.array(EducationSchema).min(1),
  glance: z.record(z.string(), GlanceItemSchema),
})

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type ResumeData = z.infer<typeof ResumeSchema>
export type Contact = z.infer<typeof ContactSchema>
export type SkillSection = z.infer<typeof SkillSectionSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type GlanceItem = z.infer<typeof GlanceItemSchema>
