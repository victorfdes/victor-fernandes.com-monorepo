import raw from "components/resume/_data/resume.json"
import { type ResumeData, ResumeSchema } from "components/resume/_data/schema"

/**
 * Validated resume data for server-side consumption.
 *
 * `parse()` runs when this module is evaluated.
 * Keep imports of this module in server code paths so Zod validation does not
 * become part of client bundles.
 */
export const resumeData: ResumeData = ResumeSchema.parse(raw)
