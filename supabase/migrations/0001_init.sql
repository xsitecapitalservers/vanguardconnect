-- ==========================================================================
-- Vanguard CRM — Initial Schema
-- ==========================================================================
-- Two-sided learning & mentorship platform.
-- Every table has RLS enabled. Team roles (admin/coach/reviewer/owner) can
-- see more; students see only their own data.
-- ==========================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- ENUMS
-- --------------------------------------------------------------------------
create type user_role as enum ('owner', 'admin', 'coach', 'reviewer', 'student', 'applicant');
create type enrollment_status as enum ('active', 'completed', 'paused', 'refunded');
create type lesson_type as enum ('video', 'text', 'quiz', 'assignment', 'live');
create type difficulty as enum ('beginner', 'intermediate', 'advanced');
create type application_stage as enum ('submitted', 'screening', 'interview', 'approved', 'rejected');
create type order_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- --------------------------------------------------------------------------
-- PROFILES  (1-to-1 with auth.users)
-- --------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  role user_role not null default 'student',
  bio text,
  timezone text default 'America/New_York',
  streak_days int not null default 0,
  xp int not null default 0,
  last_active_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_email_idx on public.profiles(email);

-- Helper: is the caller a team member?
create or replace function public.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin', 'coach', 'reviewer')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update trigger
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- PROGRAMS (top-level: "High-Ticket Mentorship", "Self-Serve Library", etc.)
-- --------------------------------------------------------------------------
create table public.programs (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  is_high_ticket boolean not null default false,
  requires_application boolean not null default false,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- COURSES
-- --------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid references public.programs(id) on delete set null,
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  cover_image text,
  price_cents int not null default 0,
  currency text not null default 'USD',
  stripe_product_id text,
  stripe_price_id text,
  difficulty difficulty not null default 'beginner',
  duration_minutes int default 0,
  is_published boolean not null default false,
  instructor_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_program_idx on public.courses(program_id);
create index courses_published_idx on public.courses(is_published);

create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- MODULES & LESSONS
-- --------------------------------------------------------------------------
create table public.modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index modules_course_idx on public.modules(course_id, position);

create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  type lesson_type not null default 'video',
  position int not null default 0,
  duration_seconds int default 0,
  -- Video (Mux)
  mux_asset_id text,
  mux_playback_id text,
  mux_playback_policy text default 'signed',
  -- Text
  body_markdown text,
  -- Attachments
  attachments jsonb default '[]'::jsonb,
  -- Transcript for search + AI
  transcript text,
  is_free_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_module_idx on public.lessons(module_id, position);
create index lessons_transcript_fts on public.lessons using gin (to_tsvector('english', coalesce(transcript, '')));

create trigger lessons_touch before update on public.lessons
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- ENROLLMENTS
-- --------------------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status enrollment_status not null default 'active',
  progress_pct numeric(5,2) not null default 0,
  purchased_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

create index enrollments_user_idx on public.enrollments(user_id);
create index enrollments_course_idx on public.enrollments(course_id);

-- --------------------------------------------------------------------------
-- LESSON PROGRESS
-- --------------------------------------------------------------------------
create table public.lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  seconds_watched int not null default 0,
  last_position int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index lesson_progress_user_idx on public.lesson_progress(user_id);

-- --------------------------------------------------------------------------
-- APPLICATIONS (high-ticket vetting pipeline)
-- --------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  stage application_stage not null default 'submitted',
  answers jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  ai_summary text,
  assigned_reviewer uuid references public.profiles(id),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_idx on public.applications(user_id);
create index applications_stage_idx on public.applications(stage);
create index applications_reviewer_idx on public.applications(assigned_reviewer);

create trigger applications_touch before update on public.applications
  for each row execute function public.touch_updated_at();

create table public.application_notes (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create index application_notes_app_idx on public.application_notes(application_id);

-- --------------------------------------------------------------------------
-- ASSESSMENTS
-- --------------------------------------------------------------------------
create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  pass_threshold numeric(5,2) default 70,
  time_limit_minutes int,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  type text not null check (type in ('mcq','short_answer','essay','code','upload')),
  prompt text not null,
  options jsonb,
  correct_answer jsonb,
  rubric text,
  points int not null default 1,
  position int not null default 0
);

create index questions_assessment_idx on public.questions(assessment_id, position);

create table public.attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  passed boolean,
  graded_by uuid references public.profiles(id),
  feedback text,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  graded_at timestamptz
);

create index attempts_user_idx on public.attempts(user_id);

-- --------------------------------------------------------------------------
-- COMMERCE
-- --------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id),
  program_id uuid references public.programs(id),
  amount_cents int not null,
  currency text not null default 'USD',
  status order_status not null default 'pending',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders(user_id);

create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- MENTORSHIP SESSIONS
-- --------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id),
  scheduled_at timestamptz not null,
  duration_minutes int not null default 30,
  meeting_url text,
  recording_url text,
  notes text,
  action_items jsonb default '[]'::jsonb,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','no_show')),
  created_at timestamptz not null default now()
);

create index sessions_mentee_idx on public.sessions(mentee_id);
create index sessions_mentor_idx on public.sessions(mentor_id);

-- --------------------------------------------------------------------------
-- ENGAGEMENT: badges, streaks, notifications
-- --------------------------------------------------------------------------
create table public.badges (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  xp_reward int default 0
);

create table public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

create table public.certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  serial text unique not null default replace(uuid_generate_v4()::text, '-', ''),
  issued_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, read_at);

-- --------------------------------------------------------------------------
-- AUDIT LOG
-- --------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_actor_idx on public.audit_log(actor_id);
create index audit_log_created_idx on public.audit_log(created_at desc);

-- ==========================================================================
-- ROW LEVEL SECURITY
-- ==========================================================================

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.applications enable row level security;
alter table public.application_notes enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.orders enable row level security;
alter table public.sessions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- PROFILES
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles: team reads all" on public.profiles
  for select using (public.is_team_member());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles: admin updates all" on public.profiles
  for update using (public.is_admin());

-- PROGRAMS — public read for published
create policy "programs: anyone reads" on public.programs
  for select using (true);
create policy "programs: admin manages" on public.programs
  for all using (public.is_admin()) with check (public.is_admin());

-- COURSES — published visible to all; drafts only to team
create policy "courses: published visible" on public.courses
  for select using (is_published = true);
create policy "courses: team sees all" on public.courses
  for select using (public.is_team_member());
create policy "courses: admin manages" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- MODULES & LESSONS — readable if course is visible + user is enrolled or free preview
create policy "modules: readable with course" on public.modules
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = modules.course_id
        and (c.is_published = true or public.is_team_member())
    )
  );
create policy "modules: admin manages" on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons: enrolled or preview" on public.lessons
  for select using (
    is_free_preview = true
    or public.is_team_member()
    or exists (
      select 1 from public.enrollments e
      join public.modules m on m.course_id = e.course_id
      where m.id = lessons.module_id
        and e.user_id = auth.uid()
        and e.status = 'active'
    )
  );
create policy "lessons: admin manages" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ENROLLMENTS
create policy "enrollments: read own" on public.enrollments
  for select using (user_id = auth.uid() or public.is_team_member());
create policy "enrollments: insert own" on public.enrollments
  for insert with check (user_id = auth.uid() or public.is_team_member());
create policy "enrollments: team updates" on public.enrollments
  for update using (public.is_team_member());

-- LESSON PROGRESS
create policy "progress: own" on public.lesson_progress
  for select using (user_id = auth.uid() or public.is_team_member());
create policy "progress: upsert own" on public.lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- APPLICATIONS
create policy "applications: read own or team" on public.applications
  for select using (user_id = auth.uid() or public.is_team_member());
create policy "applications: insert own" on public.applications
  for insert with check (user_id = auth.uid());
create policy "applications: update own if submitted" on public.applications
  for update using (
    (user_id = auth.uid() and stage = 'submitted')
    or public.is_team_member()
  );

-- APPLICATION NOTES — team only
create policy "app_notes: team only" on public.application_notes
  for all using (public.is_team_member()) with check (public.is_team_member());

-- ASSESSMENTS / QUESTIONS — same visibility as lessons (via enrollment)
create policy "assessments: enrolled" on public.assessments
  for select using (
    public.is_team_member()
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and (e.course_id = assessments.course_id
             or e.course_id in (select course_id from public.lessons l
                                join public.modules m on m.id = l.module_id
                                where l.id = assessments.lesson_id))
    )
  );
create policy "assessments: admin manages" on public.assessments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "questions: visible with assessment" on public.questions
  for select using (
    public.is_team_member()
    or exists (select 1 from public.assessments a where a.id = questions.assessment_id)
  );
create policy "questions: admin manages" on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

-- ATTEMPTS
create policy "attempts: own" on public.attempts
  for all using (user_id = auth.uid() or public.is_team_member())
  with check (user_id = auth.uid() or public.is_team_member());

-- ORDERS
create policy "orders: own or team" on public.orders
  for select using (user_id = auth.uid() or public.is_team_member());
create policy "orders: admin writes" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- SESSIONS
create policy "sessions: participant or team" on public.sessions
  for select using (
    mentee_id = auth.uid() or mentor_id = auth.uid() or public.is_team_member()
  );
create policy "sessions: team writes" on public.sessions
  for all using (public.is_team_member()) with check (public.is_team_member());

-- BADGES
create policy "badges: anyone reads" on public.badges for select using (true);
create policy "badges: admin manages" on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

create policy "user_badges: own or team" on public.user_badges
  for select using (user_id = auth.uid() or public.is_team_member());
create policy "user_badges: insert self/team" on public.user_badges
  for insert with check (user_id = auth.uid() or public.is_team_member());

-- CERTIFICATES
create policy "certificates: own or team" on public.certificates
  for select using (user_id = auth.uid() or public.is_team_member());
create policy "certificates: team writes" on public.certificates
  for all using (public.is_team_member()) with check (public.is_team_member());

-- NOTIFICATIONS
create policy "notifications: own" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: team can push" on public.notifications
  for insert with check (public.is_team_member());

-- AUDIT LOG — admin-only read
create policy "audit: admin reads" on public.audit_log
  for select using (public.is_admin());
create policy "audit: anyone inserts" on public.audit_log
  for insert with check (true);
