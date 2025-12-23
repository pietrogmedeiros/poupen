import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: "default" | "outline" | "filled"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, variant = "default", disabled, ...props }, ref) => {
    const baseStyles = "w-full px-4 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all duration-200"
    
    const variantStyles = {
      default: `
        bg-[var(--bg-secondary)] 
        border border-[var(--border-primary)]
        text-[var(--text-primary)]
        placeholder:text-[var(--text-tertiary)]
        focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
        hover:border-[var(--border-secondary)]
      `,
      outline: `
        bg-transparent
        border border-[var(--border-primary)]
        text-[var(--text-primary)]
        placeholder:text-[var(--text-tertiary)]
        focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
        hover:border-[var(--border-secondary)]
      `,
      filled: `
        bg-[var(--bg-tertiary)]
        border border-transparent
        text-[var(--text-primary)]
        placeholder:text-[var(--text-tertiary)]
        focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
        hover:bg-[var(--bg-secondary)]
      `
    }

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : ""

    const disabledStyles = disabled
      ? "opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]"
      : ""

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm md:text-base font-semibold text-[var(--text-primary)] mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`${baseStyles} ${variantStyles[variant]} ${errorStyles} ${disabledStyles} ${
            className || ""
          }`}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs md:text-sm text-red-500 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs md:text-sm text-[var(--text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
