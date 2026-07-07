import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gold text-forest hover:bg-gold/90 shadow-sm", // Primary Gold
        secondary: "border-2 border-forest text-forest bg-transparent hover:bg-forest hover:text-white", // Secondary Forest Outline
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm", // Danger Red
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground text-forest",
        link: "text-forest underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[48px] px-6 py-2",
        sm: "min-h-[48px] md:min-h-[40px] px-4",
        lg: "min-h-[56px] px-8 text-lg",
        icon: "min-h-[48px] min-w-[48px] w-12",
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
