import { SmartButton, OffCanvas, KbdShortcutBadge } from "@repo/ui"
import { navigate } from "astro:transitions/client"
import clsx from "clsx"
import AppErrorBoundary from "layouts/AppErrorBoundary"
import { ThemeProvider } from "layouts/ThemeProvider"
import React, { useEffect, useState } from "react"
import { TfiAlignRight } from "react-icons/tfi"
import { LINKS } from "utils/links"
import { isActivePath, isTypingTarget, navHrefForCode, PRIMARY_NAV, SHORTCUT_MODIFIER } from "utils/nav"
import CookieConsentBanner from "../components/CookieConsent/CookieConsentBanner"
import { ThemeToggle } from "../components/Header/ThemeToggle"

function SmoothHeader({
  menuOpen,
  setMenuOpen,
  currentPath,
}: Readonly<{
  menuOpen: boolean
  setMenuOpen: () => void
  currentPath: string
}>) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (globalThis.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    globalThis.addEventListener("scroll", handleScroll, { passive: true })
    return () => globalThis.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={clsx(
        "fixed left-0 top-0 z-50 w-full",
        "flex items-center",
        // Translucent rather than a gradient slab: the aurora reads through it, and the hairline
        // is what separates the header from the page — the same rule every section is drawn with.
        "bg-(--vf-header-bg) backdrop-blur-md backdrop-saturate-150",
        "border-line-soft border-b",
        "transition-all duration-300 ease-in-out print:hidden",
        {
          "h-12.5": isScrolled,
          "h-20 py-4": !isScrolled,
        }
      )}
    >
      <div className="shell flex items-center justify-between">
        <a href="/" className="no-underline">
          <img
            src="/logo/victor-logo.svg"
            alt="Victor Fernandes - Logo"
            width={172}
            height={60}
            // The mark is authored light-on-dark, so light mode inverts it. Driven by the theme
            // token rather than a React `isDark` read, which means the header no longer needs
            // theme context and the logo can never lag a theme change by a render.
            style={{ filter: "var(--vf-logo-filter)" }}
            className={clsx("origin-left transition duration-300", {
              "scale-60": isScrolled,
              "scale-100": !isScrolled,
            })}
          />
        </a>
        <div className="flex items-center gap-4">
          <nav aria-label="Main">
            <ul className="hidden items-center gap-2 md:flex">
              {PRIMARY_NAV.map((item) => {
                const active = isActivePath(currentPath, item.href)
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-keyshortcuts={`${SHORTCUT_MODIFIER}+${item.shortcut}`}
                      className={clsx(
                        "meta group/nav hover:text-accent flex items-center gap-2 no-underline transition-colors",
                        active ? "text-accent" : "text-ink-2"
                      )}
                    >
                      <KbdShortcutBadge active={active} modifierLabel={SHORTCUT_MODIFIER} shortcut={item.shortcut} />
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
          <span aria-hidden="true" className="bg-line hidden h-6 w-px md:block" />
          <SmartButton
            onClick={setMenuOpen}
            intent="tertiary"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation and settings section"
            icon={<TfiAlignRight size="26" />}
          ></SmartButton>
        </div>
      </div>
    </header>
  )
}

function AppLayoutShell({ children, currentPath }: Readonly<{ children: React.ReactNode; currentPath: string }>) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Use useEffect to close menu on path change
  useEffect(() => {
    const handlePopState = () => setMenuOpen(false)
    globalThis.addEventListener("popstate", handlePopState)
    return () => globalThis.removeEventListener("popstate", handlePopState)
  }, [])

  // Global nav shortcuts (Alt+1 Home, Alt+2 Blog, …; Option on macOS) mirror the keycap
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
        socialLinks={{ linkedin: LINKS.LINKEDIN, twitter: LINKS.X, github: LINKS.GITHUB }}
        topSlot={<ThemeToggle />}
      />

      {/*
        The page aurora (see body::before in theme.css) lights the canvas on its own. The
        cursor-tracked spotlight that used to wrap this tree was removed with the other motifs:
        two gradients over one another only made the background busy, and it cost a mousemove
        listener on every page.
      */}
      <div
        className={clsx("relative min-h-screen", "transition-all duration-500 ease-in-out", {
          "pointer-events-none select-none": menuOpen,
          "origin-left -translate-x-64 scale-[0.9]": menuOpen,
        })}
      >
        <div
          className={clsx("flex min-h-screen flex-col pt-20 transition-all duration-500 ease-in-out print:pt-0", {
            "blur-sm brightness-75": menuOpen,
          })}
        >
          <SmoothHeader
            menuOpen={menuOpen}
            setMenuOpen={() => setMenuOpen((value) => !value)}
            currentPath={currentPath}
          />

          {children}
        </div>

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
    <AppErrorBoundary fallback={<div className="pt-20">{children}</div>}>
      <ThemeProvider>
        <AppLayoutShell currentPath={currentPath}>{children}</AppLayoutShell>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}
