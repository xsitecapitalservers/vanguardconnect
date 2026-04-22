import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Vanguard Connect buttons.
 * Mono, all-caps, wide tracking — the voice of a composed program director.
 * No scale animations. A 1px press shift. Focus is a gold hairline ring.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-mono uppercase tracking-[0.18em] font-medium",
    "border-[0.5px] transition-all duration-[180ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-1))]",
    "disabled:opacity-40 disabled:pointer-events-none",
    "active:translate-y-[1px]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // INK — primary action. Ink background, parchment text.
        default:
          "bg-[hsl(var(--bg-inverse))] text-[hsl(var(--bg-1))] border-[hsl(var(--bg-inverse))] hover:bg-[hsl(var(--ink-900,0_0%_8%))]",
        // Legacy alias — many pages still call this. Mapped to ink.
        gradient:
          "bg-[hsl(var(--bg-inverse))] text-[hsl(var(--bg-1))] border-[hsl(var(--bg-inverse))] hover:bg-[hsl(var(--ink-900,0_0%_8%))]",
        // GOLD — reserved for singular emphasis (hero CTA, "Request access").
        gold:
          "bg-[hsl(var(--gold))] text-[hsl(var(--bg-inverse))] border-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-deep))] hover:border-[hsl(var(--gold-deep))]",
        // OUTLINE — secondary action. Ink rule on parchment.
        outline:
          "bg-transparent text-[hsl(var(--fg-1))] border-[hsl(var(--fg-1))] hover:bg-[hsl(var(--bg-inverse))] hover:text-[hsl(var(--bg-1))]",
        secondary:
          "bg-[hsl(var(--bg-2))] text-[hsl(var(--fg-1))] border-[hsl(var(--rule))] hover:bg-[hsl(var(--bg-3))]",
        destructive:
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] border-[hsl(var(--destructive))] hover:opacity-90",
        // GHOST — inline editorial link, NOT all-caps.
        ghost:
          "bg-transparent border-transparent text-[hsl(var(--fg-1))] normal-case tracking-normal font-sans font-medium underline underline-offset-4 decoration-[0.5px] decoration-[hsl(var(--gold))] hover:decoration-[hsl(var(--fg-1))]",
        link:
          "bg-transparent border-transparent text-[hsl(var(--fg-1))] normal-case tracking-normal font-sans underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 text-[11px]",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-11 px-6 text-[11px]",
        xl: "h-12 px-8 text-[12px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
