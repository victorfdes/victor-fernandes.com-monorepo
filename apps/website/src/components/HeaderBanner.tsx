"use client"

import { SmartButton, SmartLink } from "@repo/ui"
import clsx from "clsx"
import { TfiPlus } from "react-icons/tfi"
import { getCompanyData } from "../utils/companies"
import { LINKS } from "../utils/links"
import VictorBanner from "./VictorBanner"

const SCALE_INFO = [
  {
    company: "UPWORK",
    items: [
      {
        id: "messaging",
        content: (
          <>
            Real-time messaging and collaboration tools impacting <span className="font-bold">20M+ users</span>.
          </>
        ),
      },
      {
        id: "micro-frontends",
        content: (
          <>
            Scaled cross-team development via <span className="font-bold">micro-frontends</span>.
          </>
        ),
      },
    ],
  },
  {
    company: "CLEVERTAP",
    items: [
      {
        id: "sdk",
        content: (
          <>
            Open-source SDK with <span className="font-bold">25k+ weekly downloads</span>.
          </>
        ),
      },
      {
        id: "dashboards",
        content: (
          <>
            Built Vue-based SaaS dashboards for <span className="font-bold">real-time user behavioral analytics</span>.
          </>
        ),
      },
    ],
  },
  {
    company: "MEDIA_NET",
    items: [
      {
        id: "push-notifications",
        content: (
          <>
            Full-stack push notification system with <span className="font-bold">100K+ subscribers</span>.
          </>
        ),
      },
      {
        id: "analytics",
        content: (
          <>
            Dashboard to analyze <span className="font-bold">gigabytes</span> of daily analytics data.
          </>
        ),
      },
    ],
  },
]

// BOX_CLASSES is defined as a const to follow DRY. Used at 2 places.
const BOX_CLASSES = clsx("min-h-50 md:min-h-0 md:h-55 my-4 md:m-0 shadow-hover-box")

const HeaderBanner = () => {
  return (
    <>
      <div className="w-full">
        <VictorBanner />
      </div>
      <section className="w-full items-center justify-center gap-8">
        <div>
          <p className="mt-4">
            I'm a software engineer with 12+ years of experience building secure, reliable, and high-performance web
            applications. Across roles at Media.net, CleverTap, and Upwork, I've developed a product mindset centered on
            scale, accessibility, and resilience.
          </p>
        </div>
        <h3 className="secondary-text mb-4 mt-6 text-center">Having worked with</h3>
        {/* 1 by default, 2 on md, 4 on lg */}
        <div className="my-4 flex-wrap gap-4 md:flex">
          {SCALE_INFO.map(({ company, items }) => {
            const data = getCompanyData(company)

            return (
              <div key={company} className="md:w-[calc(50%-16px)] xl:w-[calc(25%-16px)]">
                <div className={BOX_CLASSES}>
                  <div className="mb-4 h-12 w-40 overflow-hidden">
                    {data?.logo ? (
                      <img
                        src={data.logo}
                        title={`${data.name} logo`}
                        alt={`${data.name} logo`}
                        width={140}
                        height={32}
                        className="h-full dark:brightness-0 dark:invert"
                      />
                    ) : null}
                  </div>
                  <ul className="secondary-text ml-3 list-disc text-sm">
                    {items.map((item) => (
                      <li key={item.id}>{item.content}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
          <div className="mb-4 md:w-[calc(50%-16px)] xl:w-[calc(25%-16px)]">
            <div className={BOX_CLASSES}>
              <h3 className="inline-flex items-center gap-1 font-bold dark:text-white">
                <TfiPlus className="mr-1 stroke-2" />
                More
              </h3>
              <p className="secondary-text text-sm">There's more to my work than these selected highlights.</p>
              <div>
                <SmartButton className="mt-4" intent="tertiary" href="/resume">
                  View resume
                </SmartButton>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="mt-4">
            My focus areas include website performance optimization, application hardening, and single-page
            applications. You can learn more about my career on{" "}
            <SmartLink href={LINKS.LINKEDIN} showExternalIcon>
              LinkedIn
            </SmartLink>{" "}
            and explore selected source-available work on{" "}
            <SmartLink href={LINKS.GITHUB} showExternalIcon>
              GitHub
            </SmartLink>
            .
          </p>
        </div>
      </section>
    </>
  )
}

export default HeaderBanner
