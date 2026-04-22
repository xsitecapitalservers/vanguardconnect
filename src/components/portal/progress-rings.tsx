"use client";

import { motion } from "framer-motion";

type Props = {
  watchPct: number;
  quizPct: number;
  streakPct: number;
};

export function ProgressRings({ watchPct, quizPct, streakPct }: Props) {
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <Ring size={170} stroke={10} pct={watchPct} color="hsl(260 80% 68%)" delay={0} />
      <Ring size={130} stroke={10} pct={quizPct} color="hsl(160 60% 55%)" delay={0.1} />
      <Ring size={90} stroke={10} pct={streakPct} color="hsl(35 90% 60%)" delay={0.2} />
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
        strokeOpacity={0.15}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (clamped / 100) * circumference }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
