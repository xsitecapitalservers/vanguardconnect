import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  VCBrand,
  Eyebrow,
  GoldRule,
  HairRule,
  Roman,
} from "@/components/ui/vanguard";
import { ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[hsl(var(--bg-1))] text-[hsl(var(--fg-1))]">
      {/* Restrained parchment noise */}
      <div className="pointer-events-none absolute inset-0 bg-noise" aria-hidden />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="Vanguard Connect — Home">
          <VCBrand size="md" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/courses"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-1))] transition-colors"
          >
            Curriculum
          </Link>
          <Link
            href="/programs/vanguard-mentorship/apply"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-1))] transition-colors"
          >
            Mentorship
          </Link>
          <Link
            href="/login"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-1))] transition-colors"
          >
            Sign in
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/signup">Request access</Link>
          </Button>
        </div>
      </header>

      <GoldRule className="max-w-6xl mx-auto" />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Left column — editorial plate */}
          <div className="md:col-span-7">
            <Eyebrow>
              Vol. <Roman n={1} /> · Spring Cohort · MMXXVI
            </Eyebrow>
            <h1 className="mt-6 font-display text-[56px] font-medium leading-[0.98] tracking-[-0.015em] md:text-[80px]">
              Welcome to the
              <br />
              <span className="italic-editorial font-normal">Vanguard School</span>
              <br />
              of Multifamily Investing.
            </h1>
            <p className="mt-8 max-w-xl font-editorial text-[19px] leading-[1.55] text-[hsl(var(--fg-2))] md:text-[21px]">
              Vanguard Connect is the composed workspace behind serious programs —
              a vetted cohort system where every student is tracked, every milestone
              recorded, and every credential defensible.
            </p>

            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild size="xl" variant="gold">
                <Link href="/signup">
                  Request access <ArrowUpRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/programs/vanguard-mentorship/apply">
                  Review the mentorship
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column — editorial sidecar */}
          <aside className="md:col-span-5 md:pl-10 md:border-l md:border-[hsl(var(--rule))]">
            <Eyebrow>The Doctrine</Eyebrow>
            <div className="mt-6 space-y-6">
              {[
                {
                  n: 1,
                  t: "Vet the cohort",
                  b: "Applications are read, not processed. Only serious students are admitted.",
                },
                {
                  n: 2,
                  t: "Track the milestones",
                  b: "Every lesson, assessment, and mentor session on the record.",
                },
                {
                  n: 3,
                  t: "Defend the credential",
                  b: "Outcomes verifiable by third parties. A transcript that travels.",
                },
              ].map(({ n, t, b }) => (
                <article key={n} className="flex gap-4">
                  <span className="font-display italic-editorial text-[22px] leading-none text-[hsl(var(--gold-deep))] pt-1">
                    <Roman n={n} />
                  </span>
                  <div>
                    <h3 className="font-display text-[18px] font-medium leading-tight">
                      {t}
                    </h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-[hsl(var(--fg-3))]">
                      {b}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <HairRule />
      </div>

      {/* Feature strip — editorial cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Eyebrow>The Program</Eyebrow>
            <h2 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.01em] md:text-[52px]">
              A standard, <span className="italic-editorial">composed.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-3 md:divide-x md:divide-[hsl(var(--rule))]">
          {[
            {
              n: 1,
              title: "Interactive curriculum",
              body: "Recorded lectures, searchable transcripts, code and case-study playgrounds. Every artifact archived.",
            },
            {
              n: 2,
              title: "Milestone record",
              body: "Streaks, XP, and unlockable credentials — a ledger of work, not a leaderboard.",
            },
            {
              n: 3,
              title: "Mentor-led cohorts",
              body: "Scheduled one-to-one sessions with senior operators. Shared goals. Accountability that compounds.",
            },
          ].map(({ n, title, body }) => (
            <article key={title} className="px-0 py-6 md:px-8 md:py-0">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] font-medium tracking-[0.22em] text-[hsl(var(--gold-deep))]">
                  №&nbsp;{String(n).padStart(2, "0")}
                </span>
                <span className="h-[0.5px] flex-1 bg-[hsl(var(--rule))]" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-medium leading-tight tracking-[-0.01em]">
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--fg-3))]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-10 border-t border-[hsl(var(--rule))] bg-[hsl(var(--bg-2))]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
          <VCBrand size="sm" />
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
            <Link href="/privacy" className="hover:text-[hsl(var(--fg-1))]">Privacy</Link>
            <Link href="/terms" className="hover:text-[hsl(var(--fg-1))]">Terms</Link>
            <Link href="/contact" className="hover:text-[hsl(var(--fg-1))]">Contact</Link>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--fg-4))]">
            © MMXXVI · Vanguard Connect
          </p>
        </div>
      </footer>
    </main>
  );
}
