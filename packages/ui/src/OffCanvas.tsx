import clsx from "clsx"
import React, { useEffect } from "react"
import { FaGithub } from "react-icons/fa"
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6"
import { TfiClose } from "react-icons/tfi"
import { SmartButton } from "./Button/SmartButton"

export type MenuItem = {
  label: string
  href: string
  /** 1-indexed keyboard shortcut; when set, renders a keycap badge next to the label. */
  shortcut?: number
  /** Marks the link for the page currently being viewed (`aria-current` + accent). */
  current?: boolean
}

export type SocialLinks = {
  linkedin: string
  twitter: string
  github: string
}

const OffCanvas = ({
  menuOpen,
  setMenuOpen,
  menuItems = [],
  shortcutModifier,
  socialLinks = { linkedin: "#", twitter: "#", github: "#" },
  logoUrl = "",
  topSlot,
}: Readonly<{
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  menuItems?: MenuItem[]
  /**
   * Non-printable modifier (e.g. `"Alt"`) a `MenuItem.shortcut` is pressed with. When set,
   * the keycap badge shows it as a prefix and `aria-keyshortcuts` becomes `"<modifier>+<n>"`;
   * when omitted, the badge and attribute stay a bare digit.
   */
  shortcutModifier?: string
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
    globalThis.addEventListener("keydown", onKeyDown)
    return () => globalThis.removeEventListener("keydown", onKeyDown)
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
          {menuItems.map((item, index) => {
            const modifierPrefix = shortcutModifier ? `${shortcutModifier}+` : ""
            const keyShortcuts = item.shortcut === undefined ? undefined : `${modifierPrefix}${item.shortcut}`
            return (
              <li
                key={item.href}
                // Staggered entrance: each item slides/fades in behind the panel as it opens.
                // Reduced-motion visitors get the final state instantly (no transition).
                className={clsx(
                  "transition-all duration-500 ease-out motion-reduce:transition-none",
                  menuOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                )}
                style={{ transitionDelay: menuOpen ? `${index * 70 + 120}ms` : "0ms" }}
              >
                <a
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  aria-keyshortcuts={keyShortcuts}
                  className={clsx(
                    "group/nav flex items-center justify-end gap-4 no-underline transition-colors",
                    item.current
                      ? "text-cyan-700 dark:text-cyan-300"
                      : "text-slate-800 hover:text-cyan-700 dark:text-zinc-50 dark:hover:text-cyan-300"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="relative text-3xl uppercase">
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "absolute -bottom-1 right-0 h-px w-full origin-right bg-current transition-transform duration-300 motion-reduce:transition-none",
                        item.current ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                      )}
                    />
                  </span>
                  {item.shortcut !== undefined && (
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "kbd-key h-7 shrink-0 gap-1 px-1.5 text-sm transition-colors",
                        item.current
                          ? "border-cyan-600 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300"
                          : "border-zinc-300 text-zinc-500 group-hover/nav:border-cyan-600/60 dark:border-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      {shortcutModifier && <span className="opacity-70">{shortcutModifier}</span>}
                      {item.shortcut}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
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
