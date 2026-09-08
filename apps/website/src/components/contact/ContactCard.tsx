"use client"

import { SmartButton, TextInput } from "@repo/ui"
import PageHero from "components/PageHero"
import React, { useEffect, useRef, useState } from "react"
import { PiCheckBold, PiCopyBold, PiEnvelopeSimpleBold } from "react-icons/pi"
import { trackEvent, TRACKING_EVENTS } from "utils/analytics"

interface ContactProps {
  readonly emailReversed?: string
}

// The address is stored reversed so crawlers scraping the static HTML never see it
const deobfuscateEmail = (reversed: string) => reversed.split("").reverse().join("")

const ContactCard = ({ emailReversed = "orp.sedf@civ" }: Readonly<ContactProps>) => {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const email = deobfuscateEmail(emailReversed)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleEmailClick = () => {
    trackEvent(TRACKING_EVENTS.CLICKED_CONTACT_EMAIL, { source: "contact" })
    globalThis.location.href = `mailto:${email}`
  }

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevents triggering the mailto link
    trackEvent(TRACKING_EVENTS.CLICKED_COPY_EMAIL, { source: "contact" })
    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopied(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
        }, 3000)
      })
      .catch(() => {
        // Clipboard unavailable (permissions, insecure context): keep the copy icon unchanged
      })
  }

  return (
    <>
      {/*
        Copy here is exactly what the live page carries — the name, the existing tagline, the
        availability chip and the email field. The Lumina contact artboard also sketches a
        "Let's Talk" hero, a phone line and an "Elsewhere" list, but that is new copy for a page
        that is already published, so it is left out of a purely visual pass.
      */}
      <PageHero
        lead="Victor"
        emphasis="Fernandes"
        tagline={
          <>
            Building <span className="text-accent">performant</span> frontends at{" "}
            <span className="text-accent">scale</span>
          </>
        }
        aside={
          <div className="flex flex-col gap-6">
            <h2 className="meta text-ok m-0 flex items-center gap-3 pb-0">
              <span aria-hidden="true" className="bg-ok size-1.5 shrink-0 rounded-full" />
              Available
            </h2>

            <TextInput
              value={emailReversed}
              onClick={handleEmailClick}
              readOnly
              containerClassName="h-14 cursor-pointer select-none"
              leftSlot={<PiEnvelopeSimpleBold aria-hidden="true" />}
              style={{ direction: "rtl", unicodeBidi: "bidi-override" }}
              className="select-none! text-ink cursor-pointer text-left font-mono text-sm"
              aria-label="Email address"
              name="email"
              rightSlot={
                <SmartButton
                  intent="tertiary"
                  className="size-10! outline-none"
                  aria-label="Copy email address"
                  onClick={copyToClipboard}
                  icon={copied ? <PiCheckBold size={16} className="text-ok" /> : <PiCopyBold size={16} />}
                />
              }
            />
          </div>
        }
      />
    </>
  )
}

export default ContactCard
