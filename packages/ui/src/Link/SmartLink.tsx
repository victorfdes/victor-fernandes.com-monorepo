import React, { forwardRef, useMemo } from "react"
import { GoLinkExternal } from "react-icons/go"
import { isUrlExternal } from "../utils"

export interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The destination URL, can be internal or external */
  readonly href: string
  /** Pass true to render the GoLinkExternal icon next to the children */
  readonly showExternalIcon?: boolean
}

export const SmartLink = forwardRef<HTMLAnchorElement, Readonly<SmartLinkProps>>(
  ({ href, children, showExternalIcon = false, target, rel, ...props }, ref) => {
    // Determine if the link is navigating away from the application
    const isExternal = useMemo(() => isUrlExternal(href), [href])

    // The shared inner content
    const content = (
      <>
        {children}
        {showExternalIcon && isExternal && (
          // Minimal inline-flex wrapper to keep the icon aligned with the last word
          <span
            className="relative -top-[0.1em] ml-1 inline-flex items-center align-middle leading-none"
            aria-hidden="true"
          >
            <GoLinkExternal />
          </span>
        )}
        {/* Screen-reader only text to announce external navigation */}
        {isExternal && <span className="sr-only">(opens in a new tab)</span>}
      </>
    )

    // Render standard anchor for external URLs to avoid Next.js router overhead
    if (isExternal) {
      return (
        <a ref={ref} href={href} target={target ?? "_blank"} rel={rel ?? "noopener noreferrer"} {...props}>
          {content}
        </a>
      )
    }

    // Render standard anchor for internal routing in Astro
    return (
      <a ref={ref} href={href} {...props}>
        {content}
      </a>
    )
  }
)

SmartLink.displayName = "SmartLink"
