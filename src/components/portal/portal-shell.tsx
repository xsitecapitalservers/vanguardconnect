"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Award,
  CreditCard,
  Settings,
  Bell,
  Search,
  LogOut,
  Flame,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VCBrand, Eyebrow, GoldRule } from "@/components/ui/vanguard";

type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  streak_days: number;
  xp: number;
  role: string;
};

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/courses", label: "My Curriculum", icon: BookOpen },
  { href: "/portal/applications", label: "Applications", icon: FileText },
  { href: "/portal/mentorship", label: "Mentorship", icon: Users },
  { href: "/portal/certificates", label: "Credentials", icon: Award },
  { href: "/portal/billing", label: "Billing", icon: CreditCard },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];

export function PortalShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[hsl(var(--bg-2))] text-[hsl(var(--fg-1))]">
      {/* Sidebar — ink plate with parchment foreground */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[hsl(var(--rule))] bg-[hsl(var(--bg-inverse))] text-[hsl(var(--bg-1))] md:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/portal" aria-label="Vanguard Connect — Portal">
            <VCBrand size="sm" inverse />
          </Link>
        </div>

        <div className="px-6 pt-6 pb-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
            Portal
          </span>
        </div>

        <nav className="flex-1 space-y-px px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/portal" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "text-[hsl(var(--bg-1))]"
                    : "text-white/50 hover:text-[hsl(var(--bg-1))]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="portal-active"
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] bg-[hsl(var(--gold))]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-[14px] w-[14px]" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Streak + XP stat — editorial ledger style */}
        <div className="mx-3 mb-3 border-t-[0.5px] border-[hsl(var(--gold))] bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                Record
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <Flame className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
                <span className="font-display text-[22px] font-medium leading-none text-[hsl(var(--bg-1))]">
                  {profile.streak_days}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">
                  day streak
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-white/50">
                XP
              </span>
              <div className="font-display text-[22px] font-medium leading-none text-[hsl(var(--bg-1))]">
                {profile.xp}
              </div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="border-t border-white/10 p-3">
          <form action="/auth/sign-out" method="POST">
            <div className="flex items-center gap-3 p-2">
              <Avatar>
                {profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? ""} />
                )}
                <AvatarFallback className="bg-[hsl(var(--gold))] text-[hsl(var(--bg-inverse))] font-display">
                  {initials(profile.display_name ?? profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-display text-[14px] font-medium text-[hsl(var(--bg-1))]">
                  {profile.display_name ?? "Student"}
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {profile.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                title="Sign out"
                className="text-white/50 hover:text-[hsl(var(--bg-1))] decoration-transparent hover:decoration-transparent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col bg-[hsl(var(--bg-1))]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] px-4 md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button className="flex w-full max-w-sm items-center gap-3 border-[0.5px] border-[hsl(var(--rule))] rounded-[2px] bg-[hsl(var(--bg-1))] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--fg-3))] transition-colors hover:border-[hsl(var(--fg-1))] hover:text-[hsl(var(--fg-1))]">
              <Search className="h-[14px] w-[14px]" />
              <span>Search</span>
              <kbd className="ml-auto border-[0.5px] border-[hsl(var(--rule))] rounded-[2px] bg-[hsl(var(--bg-2))] px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications" className="decoration-transparent hover:decoration-transparent">
              <Bell className="h-[14px] w-[14px]" />
            </Button>
          </div>
        </header>

        {/* Page with transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="flex-1 p-4 md:p-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
