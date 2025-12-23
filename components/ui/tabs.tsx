import * as React from "react"

interface TabItem {
  value: string
  label: string
  content: React.ReactNode
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TabItem[]
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: "default" | "underline" | "pills"
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, items, defaultValue = items[0]?.value, onValueChange, variant = "default", ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    const handleTabChange = (value: string) => {
      setActiveTab(value)
      onValueChange?.(value)
    }

    const tabButtonStyles = {
      default: "px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-200",
      underline: "px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200",
      pills: "px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200"
    }

    const activeTabStyles = {
      default: "border-[var(--accent-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]",
      underline: "border-[var(--accent-primary)] text-[var(--accent-primary)]",
      pills: "bg-[var(--accent-primary)] text-white"
    }

    const inactiveTabStyles = {
      default: "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      underline: "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      pills: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }

    return (
      <div ref={ref} className={`w-full ${className || ""}`} {...props}>
        <div className={`flex ${variant === "underline" ? "border-b border-[var(--border-primary)]" : ""}`}>
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleTabChange(item.value)}
              className={`${tabButtonStyles[variant]} ${
                activeTab === item.value
                  ? activeTabStyles[variant]
                  : inactiveTabStyles[variant]
              }`}
              aria-selected={activeTab === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {items.map((item) => (
            <div
              key={item.value}
              className={`transition-all duration-200 ${activeTab === item.value ? "block" : "hidden"}`}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

export { Tabs }
