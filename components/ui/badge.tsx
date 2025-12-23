import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info" | "outline"
  size?: "sm" | "md" | "lg"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center font-semibold rounded-full transition-all duration-200 whitespace-nowrap"

    const sizeStyles = {
      sm: "px-3 py-1 text-xs",
      md: "px-3.5 py-1.5 text-sm",
      lg: "px-4 py-2 text-base"
    }

    const variantStyles = {
      default: "bg-[var(--accent-primary)] text-white",
      success: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
      error: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
      warning: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
      info: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
      outline: "border border-[var(--border-primary)] text-[var(--text-primary)] bg-transparent"
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
          className || ""
        }`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
