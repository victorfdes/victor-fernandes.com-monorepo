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
          // Base & Layout
          "flex w-full items-center rounded-md transition-all duration-200",
          // Background colors
          "bg-zinc-200 dark:bg-zinc-800",
          // Hover state
          "hover:bg-zinc-300 dark:hover:bg-zinc-700",
          // Active/Focus state (applied to container when input is focused)
          "focus-within:bg-zinc-100 focus-within:ring-2 dark:focus-within:bg-zinc-900",
          "focus-within:ring-cyan-500 dark:focus-within:ring-cyan-400",
          // Disabled state
          { "cursor-not-allowed opacity-50 hover:bg-zinc-200 dark:hover:bg-zinc-800": disabled },
          containerClassName
        )}
      >
        {/* Left Slot */}
        {leftSlot && (
          <div className="flex h-full items-center justify-center px-3 text-zinc-500 dark:text-zinc-400">
            {leftSlot}
          </div>
        )}

        {/* Native Input */}
        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            // Base input styles
            "flex-1 bg-transparent text-zinc-900 dark:text-zinc-100",
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
