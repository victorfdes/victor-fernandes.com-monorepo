import { SmartButton, OffCanvas, Flashlight } from "@repo/ui"
import clsx from "clsx"
import { ThemeProvider, useTheme } from "layouts/ThemeProvider"
import React, { useEffect, useState } from "react"
import { TfiAlignRight } from "react-icons/tfi"
import { LINKS, MENU_ITEMS } from "utils/links"
import { ThemeToggle } from "../components/Header/ThemeToggle"

function SmoothHeader({ menuOpen, setMenuOpen }: Readonly<{ menuOpen: boolean; setMenuOpen: () => void }>) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { darkMode: isDark } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
          <nav aria-label="Main">
            <ul className="hidden space-x-6 md:flex">
              {Object.values(MENU_ITEMS).map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={clsx(
                      "uppercase no-underline",
                      "dark:text-zinc-50 dark:hover:text-cyan-300",
                      "text-zinc-900 hover:text-cyan-700"
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
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

function AppLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Use useEffect to close menu on path change
  useEffect(() => {
    const handlePopState = () => setMenuOpen(false)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <>
      <OffCanvas
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuItems={Object.values(MENU_ITEMS)}
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
            <SmoothHeader menuOpen={menuOpen} setMenuOpen={() => setMenuOpen((value) => !value)} />

            {children}
          </div>
        </Flashlight>
      </div>
    </>
  )
}

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <AppLayoutShell>{children}</AppLayoutShell>
    </ThemeProvider>
  )
}
