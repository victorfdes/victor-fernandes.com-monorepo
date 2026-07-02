import { SmartButton, OffCanvas, Flashlight } from "@repo/ui"
import { navigate } from "astro:transitions/client"
import clsx from "clsx"
import { ThemeProvider, useTheme } from "layouts/ThemeProvider"
import React, { useEffect, useState } from "react"
import { TfiAlignRight } from "react-icons/tfi"
import { LINKS } from "utils/links"
import {
  isActivePath,
  isTypingTarget,
  navHrefForCode,
  PRIMARY_NAV,
  SHORTCUT_MODIFIER,
  shortcutModifierLabelForPlatform,
  shortcutModifierNameForLabel,
} from "utils/nav"
import CookieConsentBanner from "../components/CookieConsent/CookieConsentBanner"
import { ThemeToggle } from "../components/Header/ThemeToggle"

function SmoothHeader({
  menuOpen,
  setMenuOpen,
  currentPath,
  shortcutModifierLabel,
  shortcutModifierName,
  showShortcuts,
}: Readonly<{
  menuOpen: boolean
  setMenuOpen: () => void
  currentPath: string
  shortcutModifierLabel: string
  shortcutModifierName: string
  showShortcuts: boolean
}>) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { darkMode: isDark } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      if (globalThis.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    globalThis.addEventListener("scroll", handleScroll)
    return () => globalThis.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={clsx(
        "fixed left-0 top-0 z-50 w-full",
        "flex items-center shadow-xl",
        "bg-linear-to-r from-slate-200 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-700",
        "transition-all duration-300 ease-in-out print:hidden",
        {
          "h-12.5": isScrolled,
          "h-20 py-4": !isScrolled,
        }
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8">
        <a href="/">
          <img
            src="/logo/victor-logo.svg"
            alt="Victor Fernandes - Logo"
            width={172}
            height={60}
            className={clsx("origin-left transition duration-300", {
              "scale-60": isScrolled,
              "scale-100": !isScrolled,
              invert: !isDark,
            })}
          />
        </a>
        <div className="flex items-center gap-4">
          <span
            aria-label={`Hold ${shortcutModifierName} to reveal keyboard shortcuts`}
            title={`Hold ${shortcutModifierName} to reveal keyboard shortcuts`}
            className="chip-base hidden h-7 whitespace-nowrap font-mono text-[11px] uppercase tracking-normal md:inline-flex"
          >
            <span aria-hidden="true" data-shortcut-modifier-label>
              {shortcutModifierLabel}
            </span>
            <span>shortcuts</span>
          </span>
          <nav aria-label="Main">
            <ul className="hidden items-center gap-6 md:flex">
              {PRIMARY_NAV.map((item) => {
                const active = isActivePath(currentPath, item.href)
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-keyshortcuts={`${SHORTCUT_MODIFIER}+${item.shortcut}`}
                      className={clsx(
                        "group/nav flex items-center gap-2 uppercase tracking-wide no-underline transition-colors",
                        active
                          ? "text-highlight"
                          : "text-zinc-900 hover:text-cyan-700 dark:text-zinc-50 dark:hover:text-cyan-300"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        hidden={!showShortcuts}
                        className={clsx(
                          "kbd-key h-5 gap-0.5 px-1 text-[11px] transition-colors",
                          active
                            ? "border-cyan-600 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300"
                            : "border-zinc-300 text-zinc-500 group-hover/nav:border-cyan-600/60 dark:border-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <span className="opacity-70" data-shortcut-modifier-label>
                          {shortcutModifierLabel}
                        </span>
                        {item.shortcut}
                      </span>
                      <span className="relative">
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-300 motion-reduce:transition-none",
                            active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                          )}
                        />
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <span aria-hidden="true" className="hidden h-6 w-px bg-zinc-300 md:block dark:bg-zinc-50/30" />
          <SmartButton
            onClick={setMenuOpen}
            intent="tertiary"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation and settings section"
            icon={<TfiAlignRight size="26" className="text-zinc-900 dark:text-white" />}
          ></SmartButton>
        </div>
      </div>
    </header>
  )
}

function AppLayoutShell({ children, currentPath }: Readonly<{ children: React.ReactNode; currentPath: string }>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [shortcutModifierLabel, setShortcutModifierLabel] = useState(SHORTCUT_MODIFIER)
  const shortcutModifierName = shortcutModifierNameForLabel(shortcutModifierLabel)

  // Use useEffect to close menu on path change
  useEffect(() => {
    const handlePopState = () => setMenuOpen(false)
    globalThis.addEventListener("popstate", handlePopState)
    return () => globalThis.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    const nextLabel = shortcutModifierLabelForPlatform(globalThis.navigator.userAgent)
    setShortcutModifierLabel(nextLabel)
  }, [])

  useEffect(() => {
    const syncShortcutDom = () => {
      document.documentElement.classList.toggle("shortcut-modifier-active", showShortcuts)
      document.querySelectorAll<HTMLElement>("[data-shortcut-modifier-label]").forEach((element) => {
        element.textContent = shortcutModifierLabel
      })
    }

    syncShortcutDom()
    document.addEventListener("astro:after-swap", syncShortcutDom)
    return () => {
      document.removeEventListener("astro:after-swap", syncShortcutDom)
      document.documentElement.classList.remove("shortcut-modifier-active")
    }
  }, [shortcutModifierLabel, showShortcuts])

  useEffect(() => {
    const hideShortcuts = () => setShowShortcuts(false)
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcutModifier = event.key === SHORTCUT_MODIFIER || event.altKey
      if (!isShortcutModifier || event.isComposing || event.defaultPrevented || isTypingTarget(event.target)) {
        setShowShortcuts(false)
        return
      }
      setShowShortcuts(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === SHORTCUT_MODIFIER || !event.altKey) setShowShortcuts(false)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") hideShortcuts()
    }

    globalThis.addEventListener("keydown", onKeyDown)
    globalThis.addEventListener("keyup", onKeyUp)
    globalThis.addEventListener("blur", hideShortcuts)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      globalThis.removeEventListener("keydown", onKeyDown)
      globalThis.removeEventListener("keyup", onKeyUp)
      globalThis.removeEventListener("blur", hideShortcuts)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  // Global nav shortcuts (Option/Alt+1 Home, Option/Alt+2 Blog, …) mirror the keycap
  // badge on every nav link. Alt is required so a bare digit — a printable character a speech-input user could
  // utter — never navigates on its own (WCAG 2.1.4); Ctrl/Cmd/Shift must be absent so we
  // don't shadow browser tab-switching. We match event.code, not event.key, because macOS
  // rewrites event.key while Option is held. Still inert while typing; the view-transition
  // router handles navigation.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return
      if (event.isComposing || event.defaultPrevented) return
      if (isTypingTarget(event.target)) return
      const href = navHrefForCode(event.code)
      if (!href) return
      event.preventDefault()
      setMenuOpen(false)
      navigate(href).catch(() => {
        // Ignore client navigation failures triggered from the keyboard shortcut.
      })
    }
    globalThis.addEventListener("keydown", onKeyDown)
    return () => globalThis.removeEventListener("keydown", onKeyDown)
  }, [])

  const menuItems = PRIMARY_NAV.map((item) => ({ ...item, current: isActivePath(currentPath, item.href) }))

  return (
    <>
      <OffCanvas
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuItems={menuItems}
        shortcutModifier={SHORTCUT_MODIFIER}
        shortcutModifierLabel={shortcutModifierLabel}
        showShortcuts={showShortcuts}
        socialLinks={{ linkedin: LINKS.LINKEDIN, twitter: LINKS.X, github: LINKS.GITHUB }}
        topSlot={<ThemeToggle />}
      />

      <div
        className={clsx(
          "relative min-h-screen shadow-2xl",
          "transition-all duration-500 ease-in-out",
          {
            "pointer-events-none select-none": menuOpen,
            "origin-left -translate-x-64 scale-[0.9]": menuOpen,
          },
          "dark:shadow-cyan-500/50"
        )}
      >
        <Flashlight>
          <div
            className={clsx("flex min-h-screen flex-col pt-20 transition-all duration-500 ease-in-out print:pt-0", {
              "blur-sm brightness-75": menuOpen,
            })}
          >
            <SmoothHeader
              menuOpen={menuOpen}
              setMenuOpen={() => setMenuOpen((value) => !value)}
              currentPath={currentPath}
              shortcutModifierLabel={shortcutModifierLabel}
              shortcutModifierName={shortcutModifierName}
              showShortcuts={showShortcuts}
            />

            {children}
          </div>
        </Flashlight>

        <CookieConsentBanner />
      </div>
    </>
  )
}

export default function AppLayout({
  children,
  currentPath,
}: Readonly<{ children: React.ReactNode; currentPath: string }>) {
  return (
    <ThemeProvider>
      <AppLayoutShell currentPath={currentPath}>{children}</AppLayoutShell>
    </ThemeProvider>
  )
}
