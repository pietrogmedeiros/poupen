import * as React from "react"
import { Input, InputProps } from "./input"
import { Select, SelectProps } from "./select"

export interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, helperText, required, children }, ref) => {
    return (
      <div ref={ref} className="w-full">
        {label && (
          <label className="block text-sm md:text-base font-semibold text-[var(--text-primary)] mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
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
FormField.displayName = "FormField"

export { FormField }
