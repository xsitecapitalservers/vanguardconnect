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
  Sparkles,
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
  streak_days: number;
  xp: number;
  role: string;
};

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/courses", label: "My Courses", icon: BookOpen },
  { href: "/portal/applications", label: "Applications", icon: FileText },
  { href: "/portal/mentorship", label: "Mentorship", icon: Users },
  { href: "/portal/certificates", label: "Certificates", icon: Award },
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card/30 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-brand-700" />
          <span className="font-display text-xl">Vanguard</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/portal" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="portal-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Streak + XP stat */}
        <div className="mx-3 mb-3 rounded-xl border border-border/60 bg-gradient-to-br from-amber-500/10 to-rose-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                <Flame className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-sm font-semibold">{profile.streak_days} days</p>
              </div>
            </div>
            <Badge variant="warning" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {profile.xp} XP
            </Badge>
          </div>
        </div>

        {/* User card */}
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
                <p className="truncate text-sm font-medium">{profile.display_name ?? "Student"}</p>
                <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
              </div>
              <Button variant="ghost" size="icon" type="submit" title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button className="flex w-full max-w-sm items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:bg-background">
              <Search className="h-4 w-4" />
              <span>Search courses, lessons, people…</span>
              <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page with transition */}
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
