"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["submitted", "screening", "interview", "approved"] as const;
type Stage = (typeof STAGES)[number] | "rejected";

export function ApplicationStageTracker({ stage }: { stage: Stage }) {
  if (stage === "rejected") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        This application was not a fit this round. You&apos;re welcome to re-apply after 90 days.
      </div>
    );
  }

  const currentIdx = STAGES.indexOf(stage);

  return (
    <div className="flex items-center gap-2">
      {STAGES.map((s, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary bg-primary/10 text-primary",
                  !done && !current && "border-border text-muted-foreground"
                )}
                initial={false}
                animate={current ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.6 }}
              >
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{i + 1}</span>}
              </motion.div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {s}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className="relative h-0.5 flex-1 bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: done ? "100%" : current ? "50%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
