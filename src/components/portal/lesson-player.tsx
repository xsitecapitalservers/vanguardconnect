"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Props = {
  lessonId: string;
  playbackId: string | null;
  bodyMarkdown: string | null;
  type: "video" | "text" | "quiz" | "assignment" | "live";
};

export function LessonPlayer({ lessonId, playbackId, bodyMarkdown, type }: Props) {
  const [completing, setCompleting] = React.useState(false);

  const markComplete = async () => {
    setCompleting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
        seconds_watched: 0,
        last_position: 0,
      });

    setCompleting(false);
    if (error) {
      toast.error("Couldn't save progress");
    } else {
      toast.success("Lesson marked complete 🎉");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {type === "video" && (
          <div className="relative aspect-video w-full bg-black">
            {playbackId ? (
              // Mux player loads via a simple iframe in dev; replace with @mux/mux-player-react
              <iframe
                src={`https://player.mux.com/${playbackId}?primary-color=%237c3aed`}
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                title="Video lesson"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                <div className="font-display text-3xl">Video coming soon</div>
                <p className="mt-2 text-sm opacity-70">
                  Upload a Mux asset in the admin course editor.
                </p>
              </div>
            )}
          </div>
        )}

        {type === "text" && (
          <article className="prose prose-invert max-w-none p-8">
            {bodyMarkdown ? (
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                {bodyMarkdown}
              </pre>
            ) : (
              <p className="text-muted-foreground">No content yet.</p>
            )}
          </article>
        )}

        {type !== "video" && type !== "text" && (
          <div className="p-10 text-center text-muted-foreground">
            {type === "quiz"
              ? "Quiz interface coming soon."
              : type === "assignment"
              ? "Assignment submission coming soon."
              : "Live session details coming soon."}
          </div>
        )}
      </CardContent>

      <div className="flex items-center justify-between border-t border-border p-4">
        <Button variant="ghost" size="sm">
          <Bookmark /> Save bookmark
        </Button>
        <Button variant="gradient" onClick={markComplete} disabled={completing}>
          <Check /> {completing ? "Saving…" : "Mark complete"}
        </Button>
      </div>
    </Card>
  );
}
