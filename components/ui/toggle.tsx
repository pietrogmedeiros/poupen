import * as React from "react"

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline"
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed = false, onPressedChange, size = "md", variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 hover:opacity-80 active:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]"

    const sizeStyles = {
      sm: "h-9 w-9 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base"
    }

    const variantStyles = {
      default: pressed
        ? "bg-[var(--accent-primary)] text-white"
        : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]",
      outline: pressed
        ? "bg-[var(--accent-primary)] text-white border border-[var(--accent-primary)]"
        : "border border-[var(--border-primary)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--bg-secondary)]"
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className || ""}`}
        onClick={() => onPressedChange?.(!pressed)}
        aria-pressed={pressed}
        {...props}
      />
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }
