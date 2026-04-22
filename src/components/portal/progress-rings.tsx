"use client";

import { motion } from "framer-motion";

type Props = {
  watchPct: number;
  quizPct: number;
  streakPct: number;
};

/**
 * Vanguard rings — antique gold, taupe, ink.
 * Three nested, all hairline-weight.
 */
export function ProgressRings({ watchPct, quizPct, streakPct }: Props) {
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <Ring size={170} stroke={6} pct={watchPct} color="hsl(40 48% 59%)" delay={0} />
      <Ring size={130} stroke={6} pct={quizPct} color="hsl(30 24% 44%)" delay={0.1} />
      <Ring size={90} stroke={6} pct={streakPct} color="hsl(0 0% 4%)" delay={0.2} />
    </div>
  );
}

function Ring({
  size,
  stroke,
  pct,
  color,
  delay,
}: {
  size: number;
  stroke: number;
  pct: number;
  color: string;
  delay: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <svg
      width={size}
      height={size}
      className="absolute"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeOpacity={0.12}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="butt"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (clamped / 100) * circumference }}
        transition={{ duration: 1.2, delay, ease: [0.32, 0.72, 0, 1] }}
      />
    </svg>
  );
}
