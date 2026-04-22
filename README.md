# Vanguard CRM

A two-sided learning & mentorship platform. Team backend + client portal, built with **Next.js 15 + Supabase + Stripe + Mux**.

> Read `ARCHITECTURE.md` for the full feature blueprint and recommended roadmap.

---

## Prerequisites

- Node.js **20+**
- pnpm, npm, or yarn
- A free [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine)
- A [Mux](https://mux.com) account (free tier OK for dev)

---

## 1. Install dependencies

```bash
npm install
# or
pnpm install
```

## 2. Create your Supabase project

1. Go to https://supabase.com/dashboard → **New Project**.
2. Pick a name (e.g. `vanguard-crm`), generate a strong DB password, choose a region near you.
3. Once provisioned, grab:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (Settings → API) → `SUPABASE_SERVICE_ROLE_KEY`
   - **Project ref** (the random slug in the URL) → `SUPABASE_PROJECT_ID`

## 3. Run the migrations

Two ways to apply `supabase/migrations/*.sql`:

**Option A — Supabase SQL Editor (easiest).**
Open SQL Editor → paste the contents of `0001_init.sql`, run. Then `0002_seed.sql`.

**Option B — Supabase CLI.**
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## 4. Configure environment

```bash
cp .env.example .env.local
```

Fill in every value. Leave Stripe/Mux blank for now if you just want to click around.

## 5. Run the app

```bash
npm run dev
```

Visit http://localhost:3000.

Flow:
- Land on the marketing page
- **Sign up** → automatically gets a `student` role
- Redirected to `/portal` (the student side)
- To access `/admin`, upgrade a user's `role` column to `owner` in Supabase → Table Editor → `profiles`.

---

## 6. Configure Stripe (checkout)

1. Dashboard → Developers → API keys → copy the test `sk_test_…` and `pk_test_…` into `.env.local`.
2. Install the Stripe CLI → `stripe login` → `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.
3. Test: create a published course in `/admin/courses/new`, set a price, then buy it from the public catalog.

## 7. Configure Mux (video)

1. Mux dashboard → Settings → Access Tokens → create an API token. Copy the **Token ID** and **Token Secret**.
2. Settings → Signing Keys → create a new key. Copy the **Key ID** and the base64-encoded **private key** into your env.
3. Settings → Webhooks → add `https://YOUR-DOMAIN/api/mux/webhook` → subscribe to `video.asset.ready`.

## 8. Deploy

Vercel is the path of least resistance:

```bash
vercel deploy
```

Add every env var from `.env.example` in your Vercel project settings. Point Stripe and Mux webhooks at your deployed URL.

---

## Project layout

```
src/
  app/
    (auth)/              ← login, signup, forgot-password
    admin/               ← team backend (role-gated)
    portal/              ← student portal (role-gated)
    courses/             ← public catalog + detail
    programs/[slug]/apply/ ← application intake
    api/
      stripe/checkout    ← creates a Checkout Session
      stripe/webhook     ← consumes Stripe events
      mux/upload         ← issues a direct-upload URL (team only)
      mux/webhook        ← updates lessons when encoding completes
    auth/callback/       ← OAuth + email-link callback
    auth/sign-out/
  components/
    admin/               ← admin shell + primitives
    portal/              ← portal shell + primitives
    ui/                  ← shadcn/ui components (button, card, …)
    providers.tsx
  lib/
    supabase/            ← client, server, middleware, types
    stripe/
    mux/
    utils.ts
  middleware.ts          ← role-based auth gating
supabase/
  migrations/0001_init.sql     ← full schema + RLS
  migrations/0002_seed.sql     ← badges, sample programs
  config.toml                  ← local dev config
```

---

## How to promote a user to a team role

```sql
update public.profiles set role = 'owner' where email = 'you@example.com';
```

Valid roles: `owner`, `admin`, `coach`, `reviewer`, `student`, `applicant`.

---

## What's next

Look at `ARCHITECTURE.md` §4 ("What Makes It Feel Modern & Engaging") for the prioritized feature list and §6 for the phase plan. Phase 1 (this commit) delivers the foundation — auth, schema, two-sided shell, course purchase, application intake, lesson playback.

Recommended next pickups:
1. Build the **course builder** UI in `/admin/courses/[id]` (drag-and-drop modules/lessons, Mux uploader)
2. Wire the **lesson_progress** tracking in `LessonPlayer` so rings + continue-learning update live
3. Flesh out the **application review detail** page with AI scoring + reviewer notes
4. Add the **command palette** (⌘K) — `cmdk` is already installed
5. Add the **real-time notifications** drawer with Supabase channels

Good luck — build something great.
