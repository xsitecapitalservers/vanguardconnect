"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApplicationStage, setApplicationScore, deleteApplication } from "./actions";

const STAGES = ["submitted", "screening", "interview", "approved", "rejected"] as const;
type Stage = (typeof STAGES)[number];

export function ApplicationDetailControls({
  applicationId,
  currentStage,
  currentScore,
}: {
  applicationId: string;
  currentStage: Stage;
  currentScore: number | null;
}) {
  const [pending, startTransition] = useTransition();
  const [score, setScore] = useState<string>(currentScore == null ? "" : String(currentScore));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const move = (stage: Stage) =>
    startTransition(async () => {
      try {
        await setApplicationStage(applicationId, stage);
        toast.success(`Moved to ${stage}`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });

  const saveScore = () =>
    startTransition(async () => {
      try {
        const n = score.trim() === "" ? null : Number(score);
        if (n != null && (Number.isNaN(n) || n < 0 || n > 100)) {
          toast.error("Score must be between 0 and 100");
          return;
        }
        await setApplicationScore(applicationId, n);
        toast.success(n == null ? "Score cleared" : `Score saved (${n})`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });

  const remove = () =>
    startTransition(async () => {
      try {
        await deleteApplication(applicationId);
        // redirect happens server-side
      } catch (err) {
        toast.error((err as Error).message);
      }
    });

  return (
    <Card variant="editorial">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
            Stage controls
          </p>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === currentStage ? "default" : "outline"}
                disabled={pending || s === currentStage}
                onClick={() => move(s)}
              >
                {s === "approved" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {s === "rejected" && <XCircle className="h-3.5 w-3.5" />}
                {s !== "approved" && s !== "rejected" && s !== currentStage && (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-t-[0.5px] border-[hsl(var(--rule))] pt-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score (0–100)</Label>
            <Input
              id="score"
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-28"
            />
          </div>
          <Button size="sm" variant="outline" onClick={saveScore} disabled={pending}>
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save score"}
          </Button>

          <div className="ml-auto">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[hsl(var(--fg-2))]">Delete this application?</span>
                <Button size="sm" variant="destructive" onClick={remove} disabled={pending}>
                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)} disabled={pending}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete application
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
