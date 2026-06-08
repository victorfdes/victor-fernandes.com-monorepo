import clsx from "clsx"
import React, { useEffect } from "react"
import { FaGithub } from "react-icons/fa"
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6"
import { TfiClose } from "react-icons/tfi"
import { SmartButton } from "./Button/SmartButton"

export type MenuItem = { label: string; href: string }

export type SocialLinks = {
  linkedin: string
  twitter: string
  github: string
}

const OffCanvas = ({
  menuOpen,
  setMenuOpen,
  menuItems = [],
  socialLinks = { linkedin: "#", twitter: "#", github: "#" },
  logoUrl = "",
  topSlot,
}: Readonly<{
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  menuItems?: MenuItem[]
  socialLinks?: SocialLinks
  logoUrl?: string
  /** Optional content rendered in the top bar (e.g. a theme toggle). */
  topSlot?: React.ReactNode
}>) => {
  // Close on Escape while the panel is open.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen, setMenuOpen])

  return (
    <aside
      aria-label="Site menu"
      aria-hidden={menuOpen ? undefined : true}
      // `inert` keeps the hidden panel out of the tab order and the a11y tree.
      inert={menuOpen ? undefined : true}
      className={clsx(
        "fixed right-0 top-0 z-50 h-full w-80 p-8",
        "flex flex-col justify-between",
        "bg-white dark:bg-slate-900",
        "transition-transform duration-500 ease-in-out",
        menuOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Watermark logo must not intercept clicks meant for the controls above it. */}
      {logoUrl && (
        <div className="pointer-events-none absolute bottom-32 right-8 opacity-50">
          <img src={logoUrl} alt="" aria-hidden="true" width={240} height={240} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>{topSlot}</div>
        <SmartButton
          onClick={() => setMenuOpen(false)}
          intent="tertiary"
          aria-label="Close menu"
          icon={<TfiClose size={24} />}
        />
      </div>

      <nav id="sidebar-nav" aria-label="Sidebar" className="mb-16">
        <ul className="space-y-6 text-right">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block text-3xl uppercase text-slate-800 no-underline transition-colors hover:text-cyan-700 dark:text-zinc-50 dark:hover:text-cyan-300"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <h3 className="text-right uppercase text-slate-800 dark:text-zinc-50">Socials</h3>
        <div className="mt-4 flex items-center justify-end gap-8">
          <SmartButton
            className="h-5! w-5! p-0!"
            aria-label="LinkedIn profile"
            icon={<FaLinkedinIn size={20} className="text-[#0a66c2] dark:text-zinc-50" />}
            intent="tertiary"
            href={socialLinks.linkedin}
          />
          <SmartButton
            className="h-5! w-5! p-0!"
            aria-label="X (formerly Twitter) profile"
            icon={<FaXTwitter size={20} className="text-black dark:text-zinc-50" />}
            intent="tertiary"
            href={socialLinks.twitter}
          />
          <SmartButton
            className="h-5! w-5! p-0!"
            aria-label="GitHub profile"
            icon={<FaGithub size={20} className="text-black dark:text-zinc-50" />}
            intent="tertiary"
            href={socialLinks.github}
          />
        </div>
      </div>
    </aside>
  )
}

export default OffCanvas
