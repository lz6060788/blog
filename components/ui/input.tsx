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
          "flex h-9 w-full rounded-md border border-inputx-border bg-inputx-bg px-3 py-1 text-sm text-inputx-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-theme-text-secondary placeholder:text-inputx-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inputx-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
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
