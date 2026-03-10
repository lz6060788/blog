import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input-field-border bg-input-field-bg px-3 py-1 text-sm text-input-field-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-theme-text-secondary placeholder:text-input-field-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-field-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
