"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addApplicationNote } from "./actions";

export function NoteForm({ applicationId }: { applicationId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      try {
        await addApplicationNote(applicationId, body);
        setBody("");
        toast.success("Note added");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Add an internal note for the team…"
        className="w-full rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] px-3 py-2 text-sm placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--gold))]"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add note"}
        </Button>
      </div>
    </form>
  );
}
