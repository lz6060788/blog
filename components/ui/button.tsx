import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // 使用项目的圆角风格（rounded-xl 对应 0.75rem）和焦点环样式
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-theme-btn-default-bg text-theme-btn-default-fg shadow hover:shadow-md hover:bg-theme-btn-default-bg-hover hover:text-theme-btn-default-fg-hover",
        destructive:
          "bg-theme-btn-destructive-bg text-theme-btn-destructive-fg shadow-sm hover:bg-theme-btn-destructive-bg-hover",
        outline:
          "border border-theme-btn-outline-border bg-theme-btn-outline-bg shadow-sm hover:bg-theme-btn-outline-bg-hover hover:text-theme-btn-outline-fg-hover",
        secondary:
          "bg-theme-btn-secondary-bg text-theme-btn-secondary-fg shadow-sm hover:bg-theme-btn-secondary-bg-hover",
        ghost: "hover:bg-theme-btn-ghost-bg-hover hover:text-theme-btn-ghost-fg-hover",
        link: "text-theme-btn-link-fg underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",  // 使用 h-10 匹配项目按钮高度
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-2xl px-8",  // 使用 rounded-2xl 匹配项目大按钮风格
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
