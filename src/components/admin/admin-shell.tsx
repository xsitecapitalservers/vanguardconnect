"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GraduationCap,
  FileCheck2,
  DollarSign,
  Megaphone,
  BarChart3,
  Settings,
  Shield,
  Search,
  LogOut,
  Command,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VCBrand } from "@/components/ui/vanguard";

type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: ClipboardCheck },
  { href: "/admin/courses", label: "Curriculum", icon: GraduationCap },
  { href: "/admin/assessments", label: "Assessments", icon: FileCheck2 },
  { href: "/admin/payments", label: "Ledger", icon: DollarSign },
  { href: "/admin/announcements", label: "Dispatches", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const SETTINGS_NAV = [
  { href: "/admin/team", label: "Team", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[hsl(var(--bg-2))] text-[hsl(var(--fg-1))]">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[hsl(var(--rule))] bg-[hsl(var(--bg-inverse))] text-[hsl(var(--bg-1))] md:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin" aria-label="Vanguard Connect — Admin">
            <VCBrand size="sm" inverse />
          </Link>
        </div>

        <div className="px-6 pt-6 pb-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
            Admin · Editorial Desk
          </span>
        </div>

        <nav className="flex-1 space-y-px px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
                    layoutId="admin-active"
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

          <div className="my-4 h-px bg-white/10" />

          {SETTINGS_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
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
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] bg-[hsl(var(--gold))]"
                  />
                )}
                <Icon className="relative z-10 h-[14px] w-[14px]" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

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
                  {profile.display_name ?? "Team"}
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                  <span className="inline-block size-[4px] rounded-full bg-[hsl(var(--gold))]" />
                  {profile.role}
                </span>
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

      <div className="flex min-h-screen flex-1 flex-col bg-[hsl(var(--bg-1))]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] px-4 md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button className="flex w-full max-w-md items-center gap-3 border-[0.5px] border-[hsl(var(--rule))] rounded-[2px] bg-[hsl(var(--bg-1))] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--fg-3))] transition-colors hover:border-[hsl(var(--fg-1))] hover:text-[hsl(var(--fg-1))]">
              <Search className="h-[14px] w-[14px]" />
              <span>Search the record</span>
              <kbd className="ml-auto border-[0.5px] border-[hsl(var(--rule))] rounded-[2px] bg-[hsl(var(--bg-2))] px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Command className="h-[14px] w-[14px]" /> Quick actions
            </Button>
          </div>
        </header>

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
