import * as React from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
  variant?: "default" | "outline" | "filled"
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, variant = "default", disabled, ...props }, ref) => {
    const baseStyles = "w-full px-4 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all duration-200 rounded-lg appearance-none cursor-pointer bg-no-repeat bg-right-4 pr-10"
    
    const variantStyles = {
      default: `
        bg-[var(--bg-secondary)] 
        border border-[var(--border-primary)]
        text-[var(--text-primary)]
        focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
        hover:border-[var(--border-secondary)]
      `,
      outline: `
        bg-transparent
        border border-[var(--border-primary)]
        text-[var(--text-primary)]
        focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
        hover:border-[var(--border-secondary)]
      `,
      filled: `
        bg-[var(--bg-tertiary)]
        border border-transparent
        text-[var(--text-primary)]
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
        <select
          className={`${baseStyles} ${variantStyles[variant]} ${errorStyles} ${disabledStyles} ${
            className || ""
          }`}
          disabled={disabled}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
Select.displayName = "Select"

export { Select }
