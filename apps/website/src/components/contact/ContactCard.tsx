"use client"

import { SmartButton, TextInput } from "@repo/ui"
import clsx from "clsx"
import VictorBanner from "components/VictorBanner"
import React, { useRef, useState } from "react"
import { PiCheckBold, PiCircleFill, PiCopyBold, PiEnvelopeSimpleBold } from "react-icons/pi"
import { trackEvent, TRACKING_EVENTS } from "utils/analytics"

interface ContactProps {
  readonly emailReversed?: string
}

const ContactCard = ({ emailReversed = "orp.sedf@civ" }: Readonly<ContactProps>) => {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Decrypts the email for the mailto link on interaction
  const handleEmailClick = () => {
    const email = emailReversed.split("").reverse().join("")
    trackEvent(TRACKING_EVENTS.CLICKED_CONTACT_EMAIL, { source: "contact" })
    window.location.href = `mailto:${email}`
  }

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevents triggering the mailto link
    const email = emailReversed.split("").reverse().join("")
    trackEvent(TRACKING_EVENTS.CLICKED_COPY_EMAIL, { source: "contact" })
    void navigator.clipboard.writeText(email)

    setCopied(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <div className="flex items-center justify-center">
      <div className={clsx("group relative max-w-xl overflow-hidden", "shadow-hover-box")}>
        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <PiCircleFill className="relative h-2 w-2 text-emerald-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Available
          </span>
        </div>

        <header className="mb-10">
          <VictorBanner responsive={false} />
        </header>

        <div className="space-y-4">
          <TextInput
            value={emailReversed}
            onClick={handleEmailClick}
            readOnly
            containerClassName="h-12 cursor-pointer select-none"
            leftSlot={<PiEnvelopeSimpleBold className="text-zinc-900 dark:text-zinc-50" />}
            style={{ direction: "rtl", unicodeBidi: "bidi-override" }}
            className="select-none! cursor-pointer text-left font-mono text-sm font-medium"
            aria-label="Email address"
            name="email"
            rightSlot={
              <SmartButton
                intent="tertiary"
                className="h-10! w-10! outline-none"
                aria-label="Copy"
                onClick={copyToClipboard}
                icon={
                  copied ? (
                    <PiCheckBold size={16} className="text-emerald-500" />
                  ) : (
                    <PiCopyBold size={16} className="text-zinc-900 dark:text-zinc-50" />
                  )
                }
              />
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ContactCard
