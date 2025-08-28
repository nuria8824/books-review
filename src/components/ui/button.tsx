import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[#b3cdd1] focus-visible:ring-[#b3cdd1]/50 focus-visible:ring-[3px] aria-invalid:ring-[#ffb6c1]/20 dark:aria-invalid:ring-[#ffb6c1]/40 aria-invalid:border-[#ffb6c1]",
  {
    variants: {
      variant: {
        default:
          "bg-[#b3cdd1] text-[#1c2b33] shadow-xs hover:bg-[#b3cdd1]/90",
        destructive:
          "bg-[#ffb6c1] text-white shadow-xs hover:bg-[#ffb6c1]/90 focus-visible:ring-[#ffb6c1]/20 dark:focus-visible:ring-[#ffb6c1]/40 dark:bg-[#ffb6c1]/60",
        outline:
          "border border-[#e0e0e0] bg-[#fffafa] shadow-xs hover:bg-[#d3d3d3] hover:text-[#4a4a4a] dark:bg-[#f0f0f0]/30 dark:border-[#f0f0f0] dark:hover:bg-[#f0f0f0]/50",
        secondary:
          "bg-[#e6e6e6] text-[#4a4a4a] shadow-xs hover:bg-[#e6e6e6]/80",
        ghost:
          "hover:bg-[#d3d3d3] hover:text-[#4a4a4a] dark:hover:bg-[#d3d3d3]/50",
        link: "text-[#b3cdd1] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }