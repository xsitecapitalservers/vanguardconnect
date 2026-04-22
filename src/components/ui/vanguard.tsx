import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * <VCBrand /> — the Vanguard Connect wordmark.
 * Bodoni "Vanguard" · hairline · JetBrains Mono "CONNECT"
 */
export function VCBrand({
  size = "md",
  inverse = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
  className?: string;
}) {
  const scale = { sm: 0.75, md: 1, lg: 1.4 }[size];
  const main = inverse ? "text-[hsl(var(--bg-1))]" : "text-[hsl(var(--fg-1))]";
  const sub = inverse ? "text-[hsl(var(--gold-400,var(--gold)))]" : "text-[hsl(var(--fg-3))]";
  return (
    <span
      className={cn("inline-flex items-center leading-none", className)}
      style={{ gap: 10 * scale }}
    >
      <span
        className={cn("font-display font-medium tracking-[-0.01em]", main)}
        style={{ fontSize: 22 * scale }}
      >
        Vanguard
      </span>
      <span
        className="bg-[hsl(var(--gold))]"
        style={{ width: 0.5, height: 18 * scale }}
      />
      <span
        className={cn("font-mono font-medium uppercase", sub)}
        style={{ fontSize: 9 * scale, letterSpacing: "0.22em" }}
      >
        Connect
      </span>
    </span>
  );
}

/**
 * <VCMark /> — the square monogram (V inside a gold frame on ink).
 */
export function VCMark({
  size = 32,
  inverse = false,
  className,
}: {
  size?: number;
  inverse?: boolean;
  className?: string;
}) {
  const bg = inverse ? "bg-[hsl(var(--bg-1))]" : "bg-[hsl(var(--bg-inverse))]";
  const letter = inverse ? "text-[hsl(var(--bg-inverse))]" : "text-[hsl(var(--bg-1))]";
  return (
    <span
      className={cn("relative inline-flex items-center justify-center shrink-0", bg, className)}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute border-[0.5px] border-[hsl(var(--gold))]"
        style={{ inset: size * 0.09 }}
      />
      <span
        className={cn("font-display font-medium leading-none", letter)}
        style={{ fontSize: size * 0.6 }}
      >
        V
      </span>
    </span>
  );
}

/** Small mono eyebrow — the label above a title. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] font-medium uppercase text-[hsl(var(--fg-3))]",
        className
      )}
      style={{ letterSpacing: "0.22em" }}
    >
      {children}
    </span>
  );
}

/** Hairline rule in antique gold. */
export function GoldRule({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-[hsl(var(--gold))] block",
        vertical ? "w-[0.5px] h-full" : "h-[0.5px] w-full",
        className
      )}
    />
  );
}

/** Hairline rule in neutral ink-150. */
export function HairRule({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-[hsl(var(--rule))] block",
        vertical ? "w-[0.5px] h-full" : "h-[0.5px] w-full",
        className
      )}
    />
  );
}

/** Pill — rounded tag for status/filters only. Ink/gold palette. */
export function Pill({
  children,
  dot = false,
  className,
}: {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px]",
        "bg-[hsl(var(--bg-3))] text-[hsl(var(--fg-1))]",
        className
      )}
    >
      {dot && (
        <span className="inline-block size-[5px] rounded-full bg-[hsl(var(--gold))]" />
      )}
      {children}
    </span>
  );
}

/** Roman numeral helper. */
const ROMAN = [
  "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];
export function Roman({ n }: { n: number }) {
  if (n < 0 || n >= ROMAN.length) return <>{n}</>;
  return <span className="font-display italic-editorial">{ROMAN[n]}</span>;
}
export { ROMAN };
