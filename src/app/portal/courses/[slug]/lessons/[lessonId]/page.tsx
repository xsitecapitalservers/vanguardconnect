import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "@/components/portal/lesson-player";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Params = { params: Promise<{ slug: string; lessonId: string }> };

export default async function LessonPage({ params }: Params) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, module:modules(*, course:courses(slug, title))")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const course = (lesson as { module: { course: { slug: string; title: string } | null } | null }).module?.course;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/portal/courses/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {course?.title ?? "course"}
      </Link>

      <div>
        <h1 className="font-display text-3xl md:text-4xl">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      <LessonPlayer
        lessonId={lesson.id}
        playbackId={lesson.mux_playback_id}
        bodyMarkdown={lesson.body_markdown}
        type={lesson.type}
      />
    </div>
  );
}
