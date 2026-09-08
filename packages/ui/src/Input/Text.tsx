// components/TextInput.tsx
import clsx from "clsx"
import React, { forwardRef } from "react"

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly leftSlot?: React.ReactNode
  readonly rightSlot?: React.ReactNode
  readonly containerClassName?: string
}

export const TextInput = forwardRef<HTMLInputElement, Readonly<TextInputProps>>(
  ({ leftSlot, rightSlot, containerClassName, className, disabled, autoComplete = "true", ...props }, ref) => {
    return (
      <div
        className={clsx(
          // Base & layout. The 6px radius matches `.tag`, not `.pill`: a field is a surface to
          // fill, not an action to press, and Lumina keeps those two shapes distinct.
          "flex w-full items-center rounded-md border transition-colors duration-200",
          // Resting, hover and focus surfaces — one declaration each, themed through the tokens.
          "bg-surface border-line",
          "hover:border-ink-4",
          "focus-within:border-accent focus-within:ring-accent focus-within:ring-1",
          // Disabled state
          { "hover:border-line cursor-not-allowed opacity-50": disabled },
          containerClassName
        )}
      >
        {/* Left Slot */}
        {leftSlot && <div className="text-ink-3 flex h-full items-center justify-center px-3">{leftSlot}</div>}

        {/* Native Input */}
        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            // Base input styles
            "text-ink flex-1 bg-transparent",
            // Hide the default browser focus ring
            "outline-none",
            // Handle disabled cursor dynamically
            "disabled:cursor-not-allowed",
            // Conditional padding based on slots to prevent text crowding
            leftSlot ? "pl-0" : "pl-3",
            rightSlot ? "pr-0" : "pr-3",
            // Consumer overrides
            className
          )}
          autoComplete={autoComplete}
          {...props}
        />

        {/* Right Slot */}
        {rightSlot && <div className="flex items-center justify-center px-2">{rightSlot}</div>}
      </div>
    )
  }
)

TextInput.displayName = "TextInput"
