import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]",
        secondary:
          "border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.92)] text-[hsl(var(--fg-2))]",
        destructive:
          "border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]",
        outline: "border-[hsl(var(--border)/0.9)] text-[hsl(var(--fg))]",
        success: "border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]",
        warning: "border-[hsl(var(--warn)/0.22)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
