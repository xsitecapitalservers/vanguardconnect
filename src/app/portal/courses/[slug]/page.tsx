import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, FileText, HelpCircle, Lock } from "lucide-react";

type Params = { params: Promise<{ slug: string }> };

const TYPE_ICON = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  assignment: FileText,
  live: PlayCircle,
};

export default async function CourseDetailPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  const modules = ((course as { modules?: Array<{ id: string; title: string; position: number; lessons?: Array<{ id: string; title: string; type: keyof typeof TYPE_ICON; duration_seconds: number | null; position: number; is_free_preview: boolean }> }> }).modules ?? [])
    .sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/portal/courses" className="hover:text-foreground">My Courses</Link>
          <span>/</span>
          <span>{course.title}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl">{course.title}</h1>
        {course.subtitle && (
          <p className="text-lg text-muted-foreground">{course.subtitle}</p>
        )}
        <div className="flex items-center gap-3">
          <Badge variant="outline">{course.difficulty}</Badge>
          <Badge variant="secondary">{modules.length} modules</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Curriculum</CardTitle>
            <span className="text-sm text-muted-foreground">
              {modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0)} lessons
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {modules.map((m, i) => (
            <div key={m.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{m.title}</h3>
              </div>
              <div className="space-y-1.5 pl-9">
                {(m.lessons ?? [])
                  .sort((a, b) => a.position - b.position)
                  .map((lesson) => {
                    const Icon = TYPE_ICON[lesson.type] ?? PlayCircle;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/portal/courses/${slug}/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{lesson.title}</span>
                          {lesson.is_free_preview && (
                            <Badge variant="secondary" className="text-[10px]">Preview</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.ceil((lesson.duration_seconds ?? 0) / 60)}m
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
          {modules.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              <Lock className="mx-auto mb-2 h-5 w-5" />
              Curriculum is coming soon.
            </div>
          )}
        </CardContent>
      </Card>

      <Progress value={0} />
    </div>
  );
}
