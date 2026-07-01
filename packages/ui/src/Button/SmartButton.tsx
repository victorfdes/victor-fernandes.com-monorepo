import { Button as BaseButton } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import clsx from "clsx"
import React, { useMemo } from "react"
import { GoArrowRight } from "react-icons/go"
import { isUrlExternal } from "../utils"

const buttonVariants = cva(
  clsx(
    "group inline-flex cursor-pointer items-center justify-center rounded-3xl no-underline",
    // "font-semibold tracking-wide",
    "transition-all duration-300",
    "focus-visible:outline-offset-2",
    "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
  ),
  {
    variants: {
      intent: {
        primary: clsx(
          "bg-slate-800 text-zinc-100 shadow-sm hover:shadow-lg hover:shadow-cyan-500/20",
          "dark:bg-cyan-700 dark:hover:bg-cyan-600"
        ),
        secondary: clsx(
          "border-2 border-slate-800 bg-transparent text-slate-800 shadow-sm hover:bg-slate-800/5 hover:shadow-lg hover:shadow-cyan-500/10",
          "dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-500/10"
        ),
        tertiary: clsx(
          "bg-transparent px-0! text-slate-800 hover:text-slate-600",
          "dark:text-cyan-500 dark:hover:text-cyan-400"
        ),
      },
      size: {
        default: "h-12 px-5 py-2",
        iconOnly: "h-12 w-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "default",
    },
  }
)

type BaseButtonProps = VariantProps<typeof buttonVariants> & {
  readonly icon?: React.ReactNode
  readonly iconPosition?: "left" | "right"
  /**
   * Renders the signature trailing arrow chip that slides on hover — the
   * marquee-CTA treatment lifted from the footer. Ignored for icon-only usage.
   */
  readonly arrow?: boolean
  readonly className?: string
  readonly children?: React.ReactNode
}

type ButtonAsButton = BaseButtonProps &
  Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, keyof BaseButtonProps> & {
    href?: never
  }

type ButtonAsLink = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Polymorphic action component. Renders a native `<button>` (via Base UI, which
 * supplies accessibility) when no `href` is given, an external `<a>` for
 * off-site links, and an internal `<a>` otherwise. Icon-only usage keeps the
 * label as screen-reader text.
 */
export const SmartButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, Readonly<ButtonProps>>(
  ({ intent, icon, iconPosition = "left", arrow = false, href, className, children, ...rest }, ref) => {
    const iconOnly = useMemo(() => !children && !!icon, [children, icon])
    const size = useMemo(() => (iconOnly ? "iconOnly" : "default"), [iconOnly])
    const showArrow = arrow && !iconOnly

    const classes = clsx(
      buttonVariants({ intent, size }),
      // The arrow chip hugs the right edge, so trade the symmetric padding for a
      // tighter right inset (matching the footer CTA it was lifted from).
      showArrow && "py-2 pr-2 pl-6",
      className
    )

    const content = (
      <>
        {icon && iconPosition === "left" && (
          <span className={clsx(!iconOnly && "mr-2")} aria-hidden="true">
            {icon}
          </span>
        )}

        <span className={clsx(iconOnly && "sr-only")}>{children}</span>

        {icon && iconPosition === "right" && !iconOnly && (
          <span className="ml-2" aria-hidden="true">
            {icon}
          </span>
        )}

        {showArrow && (
          <span
            className={clsx(
              "ml-3 flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 motion-safe:group-hover:translate-x-1",
              intent === "secondary" ? "bg-slate-800/10 dark:bg-cyan-500/15" : "bg-white/15"
            )}
            aria-hidden="true"
          >
            <GoArrowRight />
          </span>
        )}
      </>
    )

    if (href) {
      const isExternal = isUrlExternal(href)
      const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}

      return (
        <a
          href={href}
          className={classes}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          {...externalProps}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      )
    }

    return (
      <BaseButton className={classes} ref={ref} {...(rest as React.ComponentPropsWithoutRef<typeof BaseButton>)}>
        {content}
      </BaseButton>
    )
  }
)

SmartButton.displayName = "SmartButton"
