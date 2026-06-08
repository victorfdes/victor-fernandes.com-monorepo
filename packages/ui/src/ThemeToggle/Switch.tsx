import clsx from "clsx"
import type { Dispatch, SetStateAction } from "react"
import { CiDark, CiLight } from "react-icons/ci"

const LABELS = {
  true: "Dark",
  false: "Light",
}

const ICONS = {
  true: <CiDark size={26} />,
  false: <CiLight size={26} />,
}

export type ThemeToggleSwitchProps = {
  readonly darkMode: boolean
  readonly setDarkMode: Dispatch<SetStateAction<boolean>>
}

/**
 * Controlled light/dark pill switch. Presentational only — the consuming app
 * owns the `darkMode` state (and its persistence) and passes `setDarkMode` so
 * the same toggle can be reused regardless of how a given app stores the theme.
 */
export const ThemeToggleSwitch = ({ darkMode, setDarkMode }: Readonly<ThemeToggleSwitchProps>) => {
  const stateKey = String(darkMode) as keyof typeof LABELS

  return (
    <button
      type="button"
      aria-pressed={darkMode}
      aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
      onClick={() => setDarkMode((prev) => !prev)}
      className={clsx(
        "relative inline-flex items-center",
        "overflow-visible rounded-xl border",
        "w-30 h-10",
        "text-sm font-medium",
        "group",
        "transition-all duration-300",
        "border-sky-200/70 bg-cyan-200/30",
        "cursor-pointer select-none",
        darkMode ? "pl-14 pr-4 text-white" : "pl-4 pr-14 text-slate-800"
      )}
    >
      <span
        className={clsx(
          "absolute top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center transition-all duration-300",
          darkMode ? "-left-2" : "left-[calc(100%-3rem)]"
        )}
      >
        <span className={clsx("absolute rounded-full", "transition-all duration-300", "bg-cyan-200/60")} />

        <span
          className={clsx(
            "absolute inset-0 rounded-full border border-sky-200/70",
            "transition-all duration-300",
            "backdrop-blur-xs"
          )}
        />

        <span className={clsx("relative z-10 transition-colors duration-300")}>{ICONS[stateKey]}</span>
      </span>

      <span className="relative z-0 leading-none">{LABELS[stateKey]}</span>
    </button>
  )
}
