import { ResumeSchema } from "./schema"
import { resumeData } from "./index"

// The real resume.json is parsed when ./index is imported, so a bad payload would
// fail the build. These tests pin that contract and document the schema's intent.
describe("resume data + schema", () => {
  it("validates the shipped resume.json against the schema", () => {
    expect(ResumeSchema.safeParse(resumeData).success).toBe(true)
    expect(resumeData.contact.firstName.length).toBeGreaterThan(0)
    expect(resumeData.experience.length).toBeGreaterThan(0)
    expect(resumeData.skillsSections.length).toBeGreaterThan(0)
  })

  it("rejects data that violates the schema", () => {
    const result = ResumeSchema.safeParse({ summary: "missing everything else" })

    expect(result.success).toBe(false)
  })

  it("requires a valid contact email", () => {
    const result = ResumeSchema.safeParse({
      ...resumeData,
      contact: { ...resumeData.contact, email: "not-an-email" },
    })

    expect(result.success).toBe(false)
  })
})
