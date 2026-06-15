import { COMPANY_DATA, getCompanyData } from "utils/companies"

describe("getCompanyData", () => {
  it("returns the record for a known company key", () => {
    expect(getCompanyData("SIFTHUB")).toEqual(COMPANY_DATA.SIFTHUB)
  })

  it("returns undefined for an unknown key", () => {
    expect(getCompanyData("NOT_A_COMPANY")).toBeUndefined()
  })

  it("does not resolve inherited Object.prototype keys", () => {
    // `Object.hasOwn` is the reason "toString"/"constructor" don't leak a function.
    expect(getCompanyData("toString")).toBeUndefined()
    expect(getCompanyData("constructor")).toBeUndefined()
  })
})
