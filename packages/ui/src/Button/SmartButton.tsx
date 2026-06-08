import { Button as BaseButton } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import clsx from "clsx"
import React, { useMemo } from "react"
import { isUrlExternal } from "../utils"

const buttonVariants = cva(
  clsx(
    "inline-flex cursor-pointer items-center justify-center rounded-md no-underline",
    "transition-colors duration-300",
    "focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
  ),
  {
    variants: {
      intent: {
        primary: clsx("bg-slate-800 text-zinc-100 hover:bg-slate-800/90", "dark:bg-cyan-700 dark:hover:bg-cyan-800/90"),
        secondary: clsx(
          "border-2 border-slate-800 bg-transparent text-slate-800 hover:bg-slate-800/10",
          "dark:border-cyan-500 dark:text-cyan-500 dark:hover:bg-cyan-500/10"
        ),
        tertiary: clsx(
          "bg-transparent px-0! text-slate-800 hover:text-slate-600",
          "dark:text-cyan-500 dark:hover:text-cyan-400"
        ),
      },
      size: {
        default: "h-12 px-4 py-2",
        iconOnly: "h-12 w-12 p-0",
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
  ({ intent, icon, iconPosition = "left", href, className, children, ...rest }, ref) => {
    const iconOnly = useMemo(() => !children && !!icon, [children, icon])
    const size = useMemo(() => (iconOnly ? "iconOnly" : "default"), [iconOnly])

    const classes = clsx(buttonVariants({ intent, size }), className)

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
