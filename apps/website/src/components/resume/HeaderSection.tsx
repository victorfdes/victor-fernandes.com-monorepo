"use client"

import { SmartButton, SmartLink } from "@repo/ui"
import type { Contact } from "components/resume/_data/schema"
import VictorBanner from "components/VictorBanner"
import { FaGithub, FaLinkedin, FaRegFilePdf } from "react-icons/fa"
import { trackEvent, TRACKING_EVENTS } from "utils/analytics"
import { cdnUrl } from "utils/cdn"
import { LINKS } from "utils/links"
import { renderInlineMarkdown } from "utils/renderInlineMarkdown"

type HeaderSectionProps = {
  readonly contact: Contact
  readonly summary: string
}

const HeaderSection = ({ contact, summary }: Readonly<HeaderSectionProps>) => {
  return (
    <section>
      <hr />
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SmartButton
            href={LINKS.GITHUB}
            intent="tertiary"
            aria-label="GitHub profile"
            onClick={() => trackEvent(TRACKING_EVENTS.CLICKED_SOCIAL_LINK, { network: "github", source: "resume" })}
            icon={<FaGithub size="26" className="cursor-pointer text-[#181717] dark:text-zinc-100" />}
          />
          <SmartButton
            href={LINKS.LINKEDIN}
            intent="tertiary"
            aria-label="LinkedIn profile"
            onClick={() => trackEvent(TRACKING_EVENTS.CLICKED_SOCIAL_LINK, { network: "linkedin", source: "resume" })}
            icon={<FaLinkedin size="26" className="cursor-pointer text-[#0077B5] dark:text-zinc-100" />}
          />
          <SmartLink
            className="border-color hidden border-l pl-4 no-underline md:inline"
            href={`https://${contact.website}`}
          >
            {contact.website}
          </SmartLink>
        </div>
        <SmartButton
          href={LINKS.RESUME_DOWNLOAD}
          className="no-underline"
          intent="primary"
          target="_blank"
          onClick={() => trackEvent(TRACKING_EVENTS.CLICKED_DOWNLOAD_RESUME, { source: "resume" })}
          icon={<FaRegFilePdf size="18" />}
        >
          <span className="no-underline">Download</span>
        </SmartButton>
      </div>
      <hr className="mt-4" />
      <div className="mt-8 flex-row-reverse items-center gap-8 md:flex">
        <img
          src={cdnUrl("i/victor-fernandes.jpg")}
          alt={`${contact.firstName} ${contact.lastName} - ${contact.headline}`}
          width={200}
          height={200}
          className="mx-auto my-4 rounded-full"
        />
        <div>
          <VictorBanner />
          <p>{renderInlineMarkdown(summary)}</p>
        </div>
      </div>
    </section>
  )
}

export default HeaderSection
