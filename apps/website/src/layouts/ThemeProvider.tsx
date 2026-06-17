"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

const ThemeContext = createContext<{
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}>({
  darkMode: false,
  setDarkMode: () => {
    /* replaced by ThemeProvider */
  },
})

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // localStorage is the source of truth (the inline head script keeps the DOM
    // `dark` class in sync with it across view transitions). Falling back to the
    // system preference mirrors that script so a missing value behaves the same.
    const stored = localStorage.getItem("theme")
    const isDark = stored ? stored === "dark" : globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    setDarkMode(isDark)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode, mounted])

  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
