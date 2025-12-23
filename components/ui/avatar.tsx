import * as React from "react"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  initials?: string
  fallback?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = "md", initials, fallback = "?", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const sizeStyles = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg"
    }

    const shouldShowFallback = !src || imageError

    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-blue-600 text-white font-semibold overflow-hidden ${
          sizeStyles[size]
        } ${className || ""}`}
        {...props}
      >
        {!shouldShowFallback ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || fallback}</span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
