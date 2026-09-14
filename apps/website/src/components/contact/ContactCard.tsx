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

/**
 * Copy via the deprecated `document.execCommand`, for origins the async Clipboard API refuses.
 *
 * That is any non-secure context — plain http on a LAN address, most commonly, which is exactly
 * how this page gets opened on a phone during development. `execCommand` is the only thing that
 * works there, so it stays as a fallback rather than as the primary path.
 *
 * The textarea is positioned off-screen instead of `display: none`, which would make it
 * unselectable, and `readOnly` keeps iOS from raising the keyboard.
 */
const copyViaExecCommand = (text: string): boolean => {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.readOnly = true
  textarea.setAttribute("aria-hidden", "true")
  textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0"
  document.body.append(textarea)

  try {
    textarea.select()
    // Deprecated on purpose: it is the only copy mechanism a non-secure context has, and this
    // function is never reached while the async Clipboard API is available.
    // eslint-disable-next-line @typescript-eslint/no-deprecated, sonarjs/deprecation
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

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

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevents triggering the mailto link
    trackEvent(TRACKING_EVENTS.CLICKED_COPY_EMAIL, { source: "contact" })

    try {
      // lib.dom types `navigator.clipboard` as always present, but outside a secure context it
      // is undefined — so reaching for `.writeText` throws *synchronously*, before any promise
      // exists to reject, and the button becomes a silent no-op. The widening cast is what lets
      // the optional chain survive `no-unnecessary-condition`; the guard is load-bearing.
      const clipboard = navigator.clipboard as Clipboard | undefined

      if (clipboard?.writeText) {
        await clipboard.writeText(email)
      } else if (!copyViaExecCommand(email)) {
        return
      }
    } catch {
      // Async API present but refused; the legacy path still works on some of those origins.
      if (!copyViaExecCommand(email)) return
    }

    setCopied(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false)
    }, 3000)
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
              <span>Available</span>
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
                <span className="tooltip" data-tooltip={copied ? "Copied!" : "Copy email address"}>
                  <SmartButton
                    intent="tertiary"
                    className="size-10! outline-none"
                    aria-label="Copy email address"
                    onClick={(event) => void copyToClipboard(event)}
                    icon={copied ? <PiCheckBold size={16} className="text-ok" /> : <PiCopyBold size={16} />}
                  />
                </span>
              }
            />

            {/*
              The tooltip is a pseudo-element and the icon swap is decorative, so neither reaches
              a screen reader. This is where the confirmation is actually announced — <output>
              carries an implicit role="status", so the text is read politely when it appears.
            */}
            <output className="sr-only">{copied ? "Email address copied to clipboard" : ""}</output>
          </div>
        }
      />
    </>
  )
}

export default ContactCard
