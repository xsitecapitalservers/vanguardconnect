import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Vanguard badge — mono, all-caps, wide tracking.
 * Replaces colorful SaaS pills with an ink/gold/outline palette.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-mono font-medium uppercase tracking-[0.18em] text-[10px] px-2 py-[3px] rounded-[2px] border-[0.5px]",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--bg-inverse))] text-[hsl(var(--bg-1))] border-[hsl(var(--bg-inverse))]",
        outline:
          "bg-transparent text-[hsl(var(--fg-1))] border-[hsl(var(--fg-1))]",
        gold:
          "bg-[hsl(var(--gold))] text-[hsl(var(--bg-inverse))] border-[hsl(var(--gold))]",
        goldOutline:
          "bg-transparent text-[hsl(var(--gold-deep))] border-[hsl(var(--gold))]",
        muted:
          "bg-[hsl(var(--bg-3))] text-[hsl(var(--fg-2))] border-transparent",
        secondary:
          "bg-[hsl(var(--bg-2))] text-[hsl(var(--fg-1))] border-[hsl(var(--rule))]",
        success:
          "bg-transparent text-[#4A6B4A] border-[#4A6B4A]",
        warning:
          "bg-transparent text-[#B88040] border-[#B88040]",
        destructive:
          "bg-transparent text-[#A04040] border-[#A04040]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
