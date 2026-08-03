import clsx from "clsx"
import { LuOption } from "react-icons/lu"

const OPTION_MODIFIER_LABEL = "⌥"

export type KbdShortcutBadgeProps = Readonly<{
  /**
   * Visual modifier label, e.g. `"Alt"`. Rendered inside a `[data-shortcut-modifier-label]`
   * span next to an always-present ⌥ icon, so a surface can swap text for icon per platform
   * with CSS alone (see `.shortcut-modifier-*` in theme.css) rather than re-rendering.
   * Pass `"⌥"` to force the icon locally. Omit it to show a bare digit.
   */
  modifierLabel?: string | undefined
  /** The literal key that triggers the shortcut, shown on the keycap. */
  shortcut: number | string
  /** Accent styling for the currently active nav item. */
  active?: boolean
  /** `sm` for inline nav rows (header/footer), `lg` for the off-canvas menu. */
  size?: "sm" | "lg"
  className?: string
}>

/**
 * Keyboard-shortcut keycap badge shared by the header nav, footer nav, and
 * off-canvas menu. Idle hover styling expects the parent link to carry the
 * `group/nav` class (all current call sites do). Always `aria-hidden`: the
 * accessible shortcut lives in the link's `aria-keyshortcuts` attribute.
 */
export const KbdShortcutBadge = ({
  modifierLabel,
  shortcut,
  active = false,
  size = "sm",
  className,
}: KbdShortcutBadgeProps) => {
  const usesOptionIcon = modifierLabel === OPTION_MODIFIER_LABEL

  return (
    <span
      aria-hidden="true"
      className={clsx(
        "kbd-key transition-colors",
        size === "lg" ? "h-7 shrink-0 gap-1 px-1.5 text-sm" : "h-5 gap-0.5 px-1 text-[11px]",
        usesOptionIcon && "shortcut-modifier-symbol",
        active
          ? "border-cyan-600 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300"
          : "secondary-text border-zinc-300 group-hover/nav:border-cyan-600/60 dark:border-zinc-600",
        className
      )}
    >
      {modifierLabel !== undefined && (
        <>
          <span className="shortcut-modifier-text opacity-70" data-shortcut-modifier-label>
            {modifierLabel}
          </span>
          <LuOption
            aria-hidden="true"
            className="shortcut-modifier-icon h-[1em] w-[1em] opacity-70"
            data-shortcut-modifier-icon
            data-testid="shortcut-modifier-option-icon"
            focusable="false"
          />
        </>
      )}
      {shortcut}
    </span>
  )
}
