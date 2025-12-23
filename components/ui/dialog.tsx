import * as React from "react"

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, title, description, children }: DialogProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl z-10 animation-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]">
        {/* Header */}
        {(title || description) && (
          <div className="p-6 border-b border-[var(--border-secondary)]">
            {title && (
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

Dialog.displayName = "Dialog"

export { Dialog }
