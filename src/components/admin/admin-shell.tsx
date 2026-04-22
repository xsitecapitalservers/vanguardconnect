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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/assessments", label: "Assessments", icon: FileCheck2 },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
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
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card/30 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-brand-700" />
            <div>
              <div className="font-display text-xl leading-none">Vanguard</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}

          <div className="my-3 h-px bg-border" />

          {SETTINGS_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          <form action="/auth/sign-out" method="POST">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <Avatar>
                {profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? ""} />
                )}
                <AvatarFallback>{initials(profile.display_name ?? profile.email)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{profile.display_name ?? "Team"}</p>
                <Badge variant="outline" className="text-[10px] capitalize">{profile.role}</Badge>
              </div>
              <Button variant="ghost" size="icon" type="submit" title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button className="flex w-full max-w-md items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:bg-background">
              <Search className="h-4 w-4" />
              <span>Search students, applications, courses…</span>
              <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Command className="h-4 w-4" /> Quick actions
            </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 p-4 md:p-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
