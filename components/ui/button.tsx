import * as React from "react"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger"
    size?: "sm" | "md" | "lg"
  }
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary:
        "bg-[var(--accent-primary)] text-white hover:opacity-90 active:scale-95 focus-visible:ring-[var(--accent-primary)]",
      secondary:
        "bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] focus-visible:ring-[var(--accent-primary)]",
      ghost:
        "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:ring-[var(--accent-primary)]",
      outline:
        "border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white focus-visible:ring-[var(--accent-primary)]",
      danger:
        "bg-[var(--status-error)] text-white hover:opacity-90 active:scale-95 focus-visible:ring-[var(--status-error)]",
    }

    const sizes = {
      sm: "h-9 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-lg",
    }

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
          className || ""
        }`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
