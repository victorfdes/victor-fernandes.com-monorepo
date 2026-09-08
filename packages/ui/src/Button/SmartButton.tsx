import { Button as BaseButton } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import clsx from "clsx"
import React, { useMemo } from "react"
import { isUrlExternal } from "../utils"

/*
  Shape comes from `.pill` / `.icon-pill` in theme.css; the intents supply colour only. Keeping
  the geometry in one place means a pill styled by hand (the footer's Ask-AI chips) and a pill
  rendered by this component cannot drift apart.

  Every intent is a single set of classes with no `dark:` twin — `bg-accent`, `text-canvas` and
  friends resolve through the token layer, and `--vf-accent` and `--vf-bg` are always opposite
  in lightness, so a filled button reads correctly in both themes from one declaration.
*/
const buttonVariants = cva(
  clsx("group no-underline", "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"),
  {
    variants: {
      intent: {
        primary: "bg-accent text-canvas border-accent hover:bg-accent-hi hover:border-accent-hi hover:text-canvas",
        secondary: "pill-accent hover:bg-chip hover:text-accent-hi hover:border-accent-hi",
        tertiary: "text-ink-2 hover:text-accent border-transparent bg-transparent px-0!",
      },
      size: {
        default: "pill",
        iconOnly: "icon-pill",
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
