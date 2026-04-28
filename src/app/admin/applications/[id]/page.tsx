import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eyebrow } from "@/components/ui/vanguard";
import { ChevronLeft, Mail, User, Briefcase, Clock } from "lucide-react";
import { initials, formatRelativeTime } from "@/lib/utils";
import { ApplicationDetailControls } from "./controls";
import { NoteForm } from "./note-form";

export const dynamic = "force-dynamic";

const STAGE_ORDER = ["submitted", "screening", "interview", "approved", "rejected"] as const;
type Stage = (typeof STAGE_ORDER)[number];

function prettyKey(k: string) {
  return k
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderAnswerValue(v: unknown) {
  if (v === null || v === undefined || v === "") {
    return <span className="text-[hsl(var(--fg-3))]">—</span>;
  }
  if (typeof v === "string") {
    if (/^https?:\/\//.test(v)) {
      return (
        <a
          href={v}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[0.5px] decoration-[hsl(var(--gold))] underline-offset-4 hover:decoration-[hsl(var(--fg-1))]"
        >
          {v}
        </a>
      );
    }
    return <span className="whitespace-pre-wrap">{v}</span>;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return <span className="font-mono">{String(v)}</span>;
  }
  return (
    <pre className="whitespace-pre-wrap break-all rounded-[2px] bg-[hsl(var(--bg-2))] p-2 font-mono text-[11px]">
      {JSON.stringify(v, null, 2)}
    </pre>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: app } = await admin
    .from("applications")
    .select(
      "id, stage, user_id, program_id, score, ai_summary, answers, assigned_reviewer, decided_by, decided_at, created_at"
    )
    .eq("id", id)
    .single();

  if (!app) notFound();

  // Hydrate user from profiles, falling back to auth.users
  let user: {
    id: string | null;
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    timezone: string | null;
  } | null = null;

  if (app.user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id, display_name, email, avatar_url, bio, timezone")
      .eq("id", app.user_id as string)
      .maybeSingle();

    if (profile) {
      user = profile as typeof user;
    } else {
      const { data: authUser } = await admin.auth.admin.getUserById(app.user_id as string);
      if (authUser?.user) {
        user = {
          id: authUser.user.id,
          display_name:
            (authUser.user.user_metadata?.display_name as string | undefined) ?? null,
          email: authUser.user.email ?? null,
          avatar_url: null,
          bio: null,
          timezone: null,
        };
      }
    }
  }

  // Pull answers from JSON, plus a fallback name/email if the form embedded them
  const answers = (app.answers ?? {}) as Record<string, unknown>;
  const answerName =
    typeof answers.full_name === "string" ? (answers.full_name as string) : null;
  const answerEmail =
    typeof answers.email === "string" ? (answers.email as string) : null;

  const headline =
    user?.display_name || user?.email || answerName || answerEmail || "Unknown applicant";

  // Program
  let programName: string | null = null;
  if (app.program_id) {
    const { data: program } = await admin
      .from("programs")
      .select("name")
      .eq("id", app.program_id as string)
      .maybeSingle();
    programName = (program?.name as string) ?? null;
  }

  // Notes
  const { data: notes } = await admin
    .from("application_notes")
    .select("id, body, created_at, author_id")
    .eq("application_id", id)
    .order("created_at", { ascending: false });

  const noteAuthorIds = Array.from(
    new Set((notes ?? []).map((n) => n.author_id as string).filter(Boolean))
  );
  const authorById = new Map<string, { display_name: string | null; email: string | null }>();
  if (noteAuthorIds.length) {
    const { data: authors } = await admin
      .from("profiles")
      .select("id, display_name, email")
      .in("id", noteAuthorIds);
    (authors ?? []).forEach((a) =>
      authorById.set(a.id as string, {
        display_name: a.display_name as string | null,
        email: a.email as string | null,
      })
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-1))]"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to applications
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            {user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
            <AvatarFallback className="text-sm">{initials(headline) || "—"}</AvatarFallback>
          </Avatar>
          <div>
            <Eyebrow>Editorial Desk · Application</Eyebrow>
            <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.05] tracking-[-0.015em]">
              {headline}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[hsl(var(--fg-3))]">
              {user?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${user.email}`} className="hover:text-[hsl(var(--fg-1))]">
                    {user.email}
                  </a>
                </span>
              )}
              {programName && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {programName}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Submitted {formatRelativeTime(app.created_at)}
              </span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {app.stage}
        </Badge>
      </div>

      {/* Stage controls */}
      <ApplicationDetailControls
        applicationId={app.id as string}
        currentStage={app.stage as Stage}
        currentScore={app.score == null ? null : Number(app.score)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="editorial">
            <CardHeader>
              <CardTitle>Answers</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(answers).length === 0 ? (
                <p className="text-[13px] text-[hsl(var(--fg-3))]">
                  No answers were submitted with this application.
                </p>
              ) : (
                <dl className="divide-y divide-[hsl(var(--rule))]">
                  {Object.entries(answers).map(([k, v]) => (
                    <div key={k} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
                        {prettyKey(k)}
                      </dt>
                      <dd className="text-[14px] text-[hsl(var(--fg-1))]">
                        {renderAnswerValue(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>

          {app.ai_summary && (
            <Card variant="editorial">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[hsl(var(--fg-2))] whitespace-pre-wrap">
                  {app.ai_summary as string}
                </p>
              </CardContent>
            </Card>
          )}

          <Card variant="editorial">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NoteList notes={notes ?? []} authors={authorById} applicationId={app.id as string} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="editorial">
            <CardHeader>
              <CardTitle>Applicant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              <DetailRow icon={<User className="h-3 w-3" />} label="Name">
                {user?.display_name ?? answerName ?? "—"}
              </DetailRow>
              <DetailRow icon={<Mail className="h-3 w-3" />} label="Email">
                {user?.email ?? answerEmail ?? "—"}
              </DetailRow>
              {user?.timezone && (
                <DetailRow icon={<Clock className="h-3 w-3" />} label="Timezone">
                  {user.timezone}
                </DetailRow>
              )}
              {user?.bio && (
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
                    Bio
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[hsl(var(--fg-2))]">{user.bio}</p>
                </div>
              )}
              {!user && (
                <p className="text-[hsl(var(--fg-3))]">
                  No matching profile found for this application. The submission may have come from
                  an automation that bypassed signup.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[hsl(var(--fg-1))]">{children}</div>
    </div>
  );
}

function NoteList({
  notes,
  authors,
  applicationId,
}: {
  notes: { id: string; body: string; created_at: string; author_id: string }[];
  authors: Map<string, { display_name: string | null; email: string | null }>;
  applicationId: string;
}) {
  // We render the input via the controls component since it needs interactivity
  return (
    <div className="space-y-4">
      <NoteForm applicationId={applicationId} />
      {notes.length === 0 ? (
        <p className="text-[13px] text-[hsl(var(--fg-3))]">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => {
            const author = authors.get(n.author_id);
            return (
              <li
                key={n.id}
                className="rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-2))] p-3"
              >
                <div className="flex items-center justify-between text-[11px] text-[hsl(var(--fg-3))]">
                  <span className="font-medium text-[hsl(var(--fg-1))]">
                    {author?.display_name ?? author?.email ?? "Reviewer"}
                  </span>
                  <span>{formatRelativeTime(n.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[14px] text-[hsl(var(--fg-1))]">
                  {n.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

