import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Trophy, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Spotlight backdrop */}
      <div className="absolute inset-0 bg-spotlight" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-brand-700" />
          <span className="font-display text-2xl">Vanguard</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground">Courses</Link>
          <Link href="/programs/vanguard-mentorship/apply" className="text-muted-foreground hover:text-foreground">Mentorship</Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="gradient" size="sm">
            <Link href="/signup">
              Get started <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center md:py-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>New cohort opens in April</span>
        </div>
        <h1 className="text-balance font-display text-6xl leading-[1.05] tracking-tight md:text-8xl">
          Learn deeply.<br />
          <span className="bg-gradient-to-br from-primary via-brand-400 to-accent-amber bg-clip-text text-transparent">
            Rise faster.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          A premium learning home for self-paced courses, high-ticket mentorships, and real accountability. Vet every student. Track every milestone. Celebrate every win.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="xl" variant="gradient">
            <Link href="/signup">
              Start learning <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="/programs/vanguard-mentorship/apply">
              Apply for mentorship
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          { icon: Zap, title: "Interactive lessons", body: "Videos, quizzes, code playgrounds, transcripts you can search." },
          { icon: Trophy, title: "Streaks & certificates", body: "Daily XP, unlockable badges, verifiable credentials." },
          { icon: Users, title: "Real mentorship", body: "Booked sessions, shared goals, accountability that compounds." },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/40 py-8 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Vanguard. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
