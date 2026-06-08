import { ThemeToggleSwitch } from "@repo/ui"
import { useTheme } from "../../layouts/ThemeProvider"

/**
 * Light/dark switch wired to the app-wide {@link useTheme} context so the choice
 * is persisted and shared with the FOUC-prevention script in the layout head.
 */
export function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme()

  return <ThemeToggleSwitch darkMode={darkMode} setDarkMode={setDarkMode} />
}
