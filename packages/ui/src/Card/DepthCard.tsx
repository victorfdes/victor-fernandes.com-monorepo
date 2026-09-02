import clsx from "clsx"
import React from "react"

/**
 * The orbit stack, outermost disc first. Sizes and depths come from `:nth-child` in
 * theme.css, so these names exist only to key the list; the innermost disc holds `logo`.
 */
const ORBIT_CIRCLES = ["outer", "upper", "middle", "lower", "inner"] as const

export type DepthCardProps = Readonly<{
  /**
   * Any CSS colour. It is the single value set per instance — the gradient, title, body,
   * CTA and icon tones are all mixed from it in `theme.css` (see the `--dc-*` custom
   * properties), so one prop themes the whole card. Tuned for saturated mid-to-light
   * accents: a near-black accent derives near-black text on a near-black face. Override
   * an individual `--dc-*` via `className` for those cases.
   */
  color: string
  /** Heading text, rendered in the card's accent-tinted heading style. */
  title: string
  /** Body content, rendered under the title. */
  children?: React.ReactNode
  /**
   * Whole JSX elements — an `<a href>`, a `<button onClick>`, or a bare icon. Each is
   * dropped into a fixed white circle: the element itself owns the link or handler, the
   * card supplies only the chrome and stretches the element to fill it.
   */
  actions?: readonly React.ReactNode[]
  /** Bottom-right affordance. Rendered with the trailing chevron when set. */
  cta?: React.ReactNode
  /** Mark for the innermost orbit circle. Decorative — the stack is `aria-hidden`. */
  logo?: React.ReactNode
  className?: string
}>

/**
 * Layered 3D card: a saturated accent face under a white glass sheen, with a stack of
 * concentric discs in the top corner. Hovering (or tabbing into an action) tilts the
 * card and lifts every layer to its own depth, producing parallax.
 *
 * Deliberately the one glassmorphic primitive in the library — `.shadow-hover-box`
 * remains the default card treatment for site chrome.
 */
export const DepthCard = ({ color, title, children, actions = [], cta, logo, className }: DepthCardProps) => (
  <div
    className={clsx("depth-card", className)}
    data-testid="depth-card"
    // A runtime colour cannot travel through a Tailwind class (they are scanned as
    // literals), so the accent is handed to the stylesheet as a custom property. React's
    // CSSProperties has no index signature for those, hence the cast.
    style={{ "--depth-card-accent": color } as React.CSSProperties}
  >
    <div className="depth-card__body">
      <span className="depth-card__orbit" aria-hidden="true">
        {ORBIT_CIRCLES.map((name) => {
          const innermost = name === "inner"

          return (
            <span
              key={name}
              className="depth-card__circle"
              // The stack is decorative, so the innermost disc carries a test hook
              // rather than a role for the logo assertion.
              data-testid={innermost ? "depth-card-orbit-inner" : undefined}
            >
              {innermost && logo}
            </span>
          )
        })}
      </span>

      <div className="depth-card__glass" aria-hidden="true" />

      <div className="depth-card__content">
        <span className="depth-card__title">{title}</span>
        {children !== undefined && <span className="depth-card__text">{children}</span>}
      </div>

      <div className="depth-card__bottom">
        {actions.length > 0 && (
          <ul className="depth-card__actions">
            {/*
              `Children.map` rather than a plain `.map`: the entries are opaque,
              caller-ordered elements with no identity of their own, and it keys the
              wrappers it returns from the child's own key and position for us.
            */}
            {React.Children.map(actions, (action) => (
              <li className="depth-card__action">{action}</li>
            ))}
          </ul>
        )}

        {cta !== undefined && (
          <div className="depth-card__cta">
            {cta}
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  </div>
)
