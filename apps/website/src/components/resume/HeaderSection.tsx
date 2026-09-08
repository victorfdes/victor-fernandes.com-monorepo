"use client"

import { SmartLink } from "@repo/ui"
import PageHero from "components/PageHero"
import type { Contact } from "components/resume/_data/schema"
import { FaRegFilePdf } from "react-icons/fa"
import { trackEvent, TRACKING_EVENTS } from "utils/analytics"
import { cdnUrl } from "utils/cdn"
import { LINKS } from "utils/links"
import { renderInlineMarkdown } from "utils/renderInlineMarkdown"

type HeaderSectionProps = {
  readonly contact: Contact
  readonly summary: string
}

/**
 * The résumé opens with the same hero every other page uses, then trades the intro column for
 * the things a reader of a CV actually wants within a second: the portrait, the download, and
 * the three addresses.
 */
const HeaderSection = ({ contact, summary }: Readonly<HeaderSectionProps>) => {
  const elsewhere = [
    { label: "Website", href: `https://${contact.website}`, display: contact.website },
    { label: "LinkedIn", href: `https://linkedin.com/in/${contact.linkedIn}`, display: `/in/${contact.linkedIn}` },
    { label: "GitHub", href: `https://github.com/${contact.github}`, display: `@${contact.github}` },
  ]

  return (
    <PageHero
      lead={contact.firstName}
      emphasis={contact.lastName}
      tagline={contact.headline}
      aside={
        <div className="flex flex-col gap-8">
          <img
            src={cdnUrl("images/600/victor-fernandes.jpg")}
            alt={`${contact.firstName} ${contact.lastName} - ${contact.headline}`}
            width={200}
            height={200}
            className="border-line size-50 shrink-0 rounded-full border object-cover"
          />

          <dl className="m-0 grid">
            {elsewhere.map((item, index) => (
              <div
                key={item.label}
                className={`border-line flex items-baseline justify-between gap-5 border-t py-3.5 ${
                  index === elsewhere.length - 1 ? "border-b" : ""
                }`}
              >
                <dt className="meta text-[0.6875rem] tracking-[0.2em]">{item.label}</dt>
                <dd className="m-0">
                  <SmartLink href={item.href}>{item.display}</SmartLink>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      }
    >
      <p className="lede mt-8">{renderInlineMarkdown(summary)}</p>

      <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
        <a
          href={LINKS.RESUME_DOWNLOAD}
          target="_blank"
          rel="noopener noreferrer"
          className="pill pill-accent px-6 py-3.5 tracking-[0.24em] no-underline"
          onClick={() => trackEvent(TRACKING_EVENTS.CLICKED_DOWNLOAD_RESUME, { source: "resume" })}
        >
          <FaRegFilePdf size="15" aria-hidden="true" />
          Download PDF
        </a>
        <a href={`mailto:${contact.email}`} className="mono-meta hover:text-accent no-underline">
          {contact.email}
        </a>
        <a href={`tel:${contact.phone.replaceAll(" ", "")}`} className="mono-meta hover:text-accent no-underline">
          {contact.phone}
        </a>
      </div>
    </PageHero>
  )
}

export default HeaderSection
