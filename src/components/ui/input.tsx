import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-[2px] border-[0.5px] border-[hsl(var(--rule-strong,var(--rule)))] bg-[hsl(var(--bg-1))] px-3 py-2 text-[14px] text-[hsl(var(--fg-1))]",
      "placeholder:text-[hsl(var(--fg-4))]",
      "focus-visible:outline-none focus-visible:border-[hsl(var(--fg-1))] focus-visible:ring-1 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-1))]",
      "transition-colors duration-[180ms]",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
