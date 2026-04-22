# Vanguard CRM — Architecture & Feature Blueprint

> A two-sided learning-and-mentorship platform: team backend + student portal. Modern, fluid, interactive, and engaging.

---

## 1. Stack at a Glance

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, React 19, Server Components) | Modern DX, streaming UI, edge-ready, one codebase for both portals |
| Language | TypeScript (strict) | Safety across a complex domain model |
| Database | Supabase (Postgres) | Auth + DB + storage + realtime + RLS in one |
| Auth | Supabase Auth (email + OAuth) | Built-in, supports magic links, MFA, SSO |
| Payments | Stripe (Checkout + Billing) | Subscriptions, one-time, refunds, tax |
| Video | Mux | Adaptive HLS, signed URLs, thumbnails, analytics |
| Styling | Tailwind v4 + shadcn/ui | Production-grade components, theming, speed |
| Animation | Framer Motion | Fluid page transitions, micro-interactions |
| State | Zustand + TanStack Query | Lightweight client state + server cache |
| Forms | React Hook Form + Zod | Type-safe validation end-to-end |
| Email | Resend + React Email | Transactional + marketing in JSX |
| Scheduling | Cal.com embed (or custom) | Mentor booking, coaching calls |
| Analytics | PostHog | Product analytics, funnels, session replay |
| Monitoring | Sentry | Errors + performance |
| Deployment | Vercel | Edge runtime, preview URLs, zero-config |

---

## 2. Two-Sided System Architecture

```
                 ┌─────────────────────────────────┐
                 │       Supabase Postgres         │
                 │   (RLS-protected shared DB)     │
                 └─────────────────────────────────┘
                        ▲                  ▲
                        │                  │
         ┌──────────────┘                  └──────────────┐
         │                                                │
   ┌─────────────┐                                 ┌─────────────┐
   │  /admin/*   │                                 │  /portal/*  │
   │ Team backend│                                 │ Client side │
   │  (staff)    │                                 │ (students)  │
   └─────────────┘                                 └─────────────┘
   role: admin | coach | reviewer                  role: student | applicant
```

Middleware inspects the session's `role` claim and redirects:
- No session → `/login`
- `student` / `applicant` → `/portal`
- `admin` / `coach` / `reviewer` → `/admin`

Row-Level Security enforces every query: a student can only read their own progress, their purchased courses, their applications. A coach can read assigned students.

---

## 3. Data Model (high level)

Core tables — every table has `id (uuid)`, `created_at`, `updated_at`:

**Identity & access**
- `profiles` — one row per `auth.users`, with `role`, `avatar_url`, `display_name`, `bio`, `timezone`
- `team_members` — staff-specific fields: department, title, calendly link
- `roles` & `role_permissions` — fine-grained permissions

**Catalog**
- `programs` — top-level (e.g. "High-Ticket Mentorship", "Self-Serve Course Library")
- `courses` — belongs to a program; title, slug, price, cover_image, is_published, difficulty
- `modules` — a course has many modules (ordered)
- `lessons` — a module has many lessons; `type` ∈ { video, text, quiz, assignment, live }
- `lesson_assets` — Mux `playback_id`, attachments, transcripts
- `prerequisites` — course A requires course B

**Enrollment & progress**
- `enrollments` — user ↔ course with status, purchased_at, completed_at, progress_pct
- `lesson_progress` — user ↔ lesson with `seconds_watched`, `completed_at`, last_position
- `streaks` — daily study streak tracking
- `certificates` — issued on course completion with verifiable URL

**Qualification pipeline (high-ticket programs)**
- `applications` — user ↔ program with stage, answers (jsonb), score, assigned_reviewer
- `application_stages` — configurable pipeline (Applied → Screened → Interview → Approved)
- `application_notes` — internal reviewer notes, visible to team only
- `interviews` — scheduled calls tied to applications

**Assessments**
- `assessments` — quizzes/exams attached to lessons or standalone
- `questions` — type ∈ { mcq, short_answer, essay, code, upload }
- `attempts` — user attempts with answers, score, graded_by, feedback
- `rubrics` — for manual-graded questions

**Commerce**
- `products` — Stripe-synced offering (one-time, subscription, payment plan)
- `orders` — a purchase event
- `subscriptions` — active recurring billing
- `invoices`, `refunds` — audit trail

**Engagement**
- `threads` & `posts` — per-course discussion
- `messages` — direct messages between mentor ↔ mentee
- `announcements` — pushed by team, per program or global
- `events` — live webinars, office hours, Q&A
- `rsvps` — who's attending
- `notifications` — in-app notification feed

**Analytics & ops**
- `audit_log` — every sensitive action (approvals, refunds, role changes)
- `feature_flags` — staged rollouts

---

## 4. What Makes It Feel Modern & Engaging

Here's the answer to your "what else should we add" question — ranked by impact on the *feel* of the product:

### Tier 1 — Table stakes for a modern feel
1. **Instant everything** — optimistic UI on every mutation, skeleton loaders that match final layout, no spinners for anything under 400ms.
2. **Command palette** (⌘K) — fuzzy search across courses, students, actions. Power-user magic.
3. **Dark mode** — not an afterthought; designed-for-dark with real color tokens.
4. **Page transitions** — Framer Motion shared-layout animations so nothing pops in jarringly.
5. **Real-time presence** — "3 classmates watching this lesson right now" via Supabase Realtime channels.
6. **Live notifications** — in-app toast + notification drawer, pushed from Postgres events.

### Tier 2 — Sticky engagement mechanics
7. **Streaks & XP** — daily-login streaks, XP for lesson completion, quiz scores, discussion posts. Show the streak flame in the header.
8. **Badges & certificates** — unlockable on milestones; share-to-LinkedIn button.
9. **Leaderboards** — per-cohort, weekly resets, opt-out friendly.
10. **Progress rings** — Apple-Watch-style animated rings on the dashboard for the three things that matter most (watch time, quiz accuracy, streak).
11. **"Pick up where you left off"** — the dashboard hero surfaces the exact timestamp of the last lesson.
12. **Cohort feed** — an Instagram-ish activity feed: "Sam just earned the 30-day streak badge" — fuels social proof and FOMO.

### Tier 3 — Mentorship-specific magic
13. **Mentor session booking** — embedded Cal.com widget, auto-pulls mentor availability, logs the session to the CRM.
14. **Session recording → AI recap** — after a mentor call, auto-generate action items, homework, and a follow-up email draft.
15. **Mentee pipeline board** — Kanban view for coaches: which mentees are on track, at-risk, stalled.
16. **Goal tracking** — student sets 30/60/90-day goals; mentor sees them on the sidebar of every call.
17. **Accountability check-ins** — weekly prompts ("What did you ship this week?"); mentor gets a digest.

### Tier 4 — AI that actually earns its keep
18. **AI study buddy** — per-lesson chat pane grounded in the transcript + materials; can't hallucinate beyond the source.
19. **Auto-generated lesson summaries & quiz questions** — team uploads a video, system produces a summary, key takeaways, 5 quiz questions for review.
20. **Essay & assignment grading assistant** — reviewer opens a submission; AI pre-scores against the rubric and flags specific passages — reviewer just confirms or overrides.
21. **Application-scorer** — when a high-ticket application comes in, AI scores it against your ICP and flags the strongest candidates.
22. **Personalized next-step recommender** — "Based on your pace and quiz scores, the next best lesson for you is…"

### Tier 5 — Interactivity that feels like a product, not a course
23. **Interactive lesson players** — inline quizzes that pause the video, code playgrounds (Monaco/Sandpack), diagram walkthroughs, bookmarks, notes pinned to timestamps.
24. **Transcript search & jump-to** — clickable transcripts synced to video time.
25. **Speed, captions, picture-in-picture** — standard now but still missed by most LMS products.
26. **Mobile-first + PWA** — installable to home screen, offline lesson caching for downloaded videos, native-feeling bottom nav.
27. **Downloadable worksheets auto-filled** — assignments render as a doc the student can fill inline; no separate Google Doc dance.

### Tier 6 — Admin tooling that doesn't feel like SAP
28. **Drag-and-drop course builder** — module/lesson reorder, inline editing, draft vs. published states, preview as student.
29. **One-click clone** — duplicate a course/module as a starting point.
30. **Segment builder** — build student segments ("took course X, did not buy course Y, active in last 30 days") and trigger emails / announcements.
31. **Impersonate-as-student** — team member can view the portal as any student for support without resetting passwords.
32. **Audit trail everywhere** — who approved what, who refunded what. Critical for trust.

### Tier 7 — Revenue & retention polish
33. **Payment plans** — 3/6/12-month splits on high-ticket programs.
34. **Coupons, scholarships, bundles** — standard but you'll want them.
35. **Affiliate / referral program** — students earn credit for referrals; tracks attribution.
36. **Upsell rails** — contextual "students who finished this also bought…" after course completion.
37. **Cart abandonment + win-back** — Stripe Checkout link expiring in 24h with discount for abandoned carts.
38. **Churn-risk radar** — ML-lite signal: last-activity gap, quiz-score drop, support-ticket uptick → flag in admin.

### Tier 8 — Table-stakes trust
39. **Accessibility (WCAG 2.1 AA)** — keyboard nav, focus rings, reduced-motion respect, captions.
40. **i18n-ready** — copy in translation files from day one (cheap insurance).
41. **Data export + right-to-deletion** — GDPR/CCPA buttons; don't let a future lawyer slow you down.

---

## 5. Route Map

### Public
- `/` — marketing home (redirects to portal if logged in)
- `/login`, `/signup`, `/forgot-password`
- `/courses` — public catalog
- `/courses/[slug]` — public course landing (preview)
- `/programs/[slug]/apply` — application intake for high-ticket programs

### Student portal `/portal/*`
- `/portal` — dashboard (streak, progress rings, continue learning, cohort feed)
- `/portal/courses` — my courses
- `/portal/courses/[slug]` — course home
- `/portal/courses/[slug]/lessons/[lessonId]` — lesson player
- `/portal/applications` — my applications (with stage tracker)
- `/portal/mentorship` — upcoming sessions, past notes, book time
- `/portal/community` — discussion, cohort feed
- `/portal/certificates` — earned certs
- `/portal/billing` — invoices, payment methods
- `/portal/settings` — profile, notifications, accessibility

### Team backend `/admin/*`
- `/admin` — KPI dashboard (MRR, active students, applications queue, at-risk list)
- `/admin/students` — searchable table, filters, bulk actions
- `/admin/students/[id]` — full student record + activity timeline
- `/admin/applications` — review queue, Kanban by stage
- `/admin/applications/[id]` — review detail (answers, AI score, assign, approve/reject)
- `/admin/courses` — course list
- `/admin/courses/new` — builder
- `/admin/courses/[id]` — edit + preview-as-student
- `/admin/assessments` — question bank, grading queue
- `/admin/mentorship` — mentor roster, session logs
- `/admin/payments` — orders, subscriptions, refunds
- `/admin/segments` — build student segments
- `/admin/announcements` — compose + schedule
- `/admin/analytics` — product + revenue dashboards
- `/admin/team` — team members, roles, permissions
- `/admin/settings` — org settings, branding, integrations
- `/admin/audit-log` — who did what

---

## 6. Build Phases (realistic sequencing for a solo build)

**Phase 1 — Foundation (this commit)**
Project scaffold, auth, RLS schema, two-sided shell, one end-to-end slice: student signs up → purchases course → watches a lesson → tracks progress.

**Phase 2 — Qualification pipeline**
Applications, review queue, approvals, interview scheduling.

**Phase 3 — Assessment engine**
Quizzes, essays, rubrics, grading queue.

**Phase 4 — Engagement layer**
Streaks, badges, certificates, cohort feed, notifications, command palette.

**Phase 5 — AI layer**
Study buddy, transcript search, AI scoring, recommender.

**Phase 6 — Admin power tools**
Course builder UX, segments, impersonation, announcements.

**Phase 7 — Commerce polish**
Payment plans, coupons, affiliate, churn radar, cart recovery.

**Phase 8 — Scale**
i18n, PWA, mobile apps (React Native + same Supabase).

---

## 7. Security & Compliance Baseline

- RLS on every table; no table ships without policies.
- Service-role key never leaves server routes.
- Rate limiting on auth + application endpoints (Upstash/Redis).
- Stripe webhook signature verification.
- Mux signed URLs for paid content.
- Audit log for role changes, approvals, refunds, PII exports.
- GDPR: data export + hard-delete endpoints wired from day one.
- Accessibility linting in CI (jsx-a11y, axe).

---

## 8. What's in this scaffold

This first commit delivers Phase 1: the foundation. You get:
- Working Next.js 15 + Supabase project
- Complete SQL schema with RLS policies
- Auth with role-based redirection
- Student portal shell with dashboard, course catalog, course detail, lesson player
- Admin backend shell with dashboard, students, applications queue, courses
- Stripe + Mux integration stubs (ready for your keys)
- Framer Motion page transitions, Tailwind v4, shadcn/ui components
- Fully typed with Zod validators

See `README.md` for setup instructions.
