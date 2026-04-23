"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Pencil, Search, UserX, UserCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { initials, formatRelativeTime } from "@/lib/utils";
import { updateStudent, deactivateStudent, reactivateStudent, deleteStudent } from "./actions";

type Student = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  timezone: string | null;
  deactivated_at: string | null;
  created_at: string;
};

type Props = {
  students: Student[];
  callerCanManageRole: boolean;
  callerCanDelete: boolean;
  callerId: string;
};

const ROLE_OPTIONS = ["applicant", "student", "coach", "reviewer", "admin", "owner"] as const;

export function StudentsTable({ students, callerCanManageRole, callerCanDelete, callerId }: Props) {
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [confirming, setConfirming] = useState<{ student: Student; action: "delete" | "deactivate" } | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.display_name ?? "").toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
      </div>

      <Card variant="editorial">
        <CardHeader>
          <CardTitle>{filtered.length} {filtered.length === 1 ? "student" : "students"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[hsl(var(--rule))]">
            {filtered.map((s) => {
              const isDeactivated = !!s.deactivated_at;
              const isSelf = s.id === callerId;
              return (
                <div
                  key={s.id}
                  className={`relative flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[hsl(var(--bg-2))] ${
                    isDeactivated ? "opacity-60" : ""
                  }`}
                >
                  <Avatar>
                    {s.avatar_url && <AvatarImage src={s.avatar_url} alt="" />}
                    <AvatarFallback>{initials(s.display_name ?? s.email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {s.display_name ?? s.email}
                      {isDeactivated && (
                        <span className="ml-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
                          · Deactivated
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-[hsl(var(--fg-3))]">{s.email}</p>
                  </div>
                  <div className="hidden flex-col items-end md:flex">
                    <Badge variant="outline" className="capitalize">
                      {s.role}
                    </Badge>
                    <span className="mt-1 text-[11px] text-[hsl(var(--fg-3))]">
                      Joined {formatRelativeTime(s.created_at)}
                    </span>
                  </div>

                  {/* Action menu */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-haspopup="menu"
                      aria-expanded={openMenu === s.id}
                      onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open actions</span>
                    </Button>
                    {openMenu === s.id && (
                      <>
                        {/* Click-outside shroud */}
                        <button
                          type="button"
                          className="fixed inset-0 z-40 cursor-default"
                          aria-label="Close menu"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div
                          role="menu"
                          className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] shadow-lg"
                        >
                          <MenuItem
                            icon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => {
                              setOpenMenu(null);
                              setEditing(s);
                            }}
                          >
                            Edit
                          </MenuItem>
                          {isDeactivated ? (
                            <MenuItem
                              icon={<UserCheck className="h-3.5 w-3.5" />}
                              onClick={async () => {
                                setOpenMenu(null);
                                try {
                                  await reactivateStudent(s.id);
                                  toast.success("Account reactivated");
                                } catch (err) {
                                  toast.error((err as Error).message);
                                }
                              }}
                            >
                              Reactivate
                            </MenuItem>
                          ) : (
                            <MenuItem
                              icon={<UserX className="h-3.5 w-3.5" />}
                              onClick={() => {
                                setOpenMenu(null);
                                if (isSelf) {
                                  toast.error("You can't deactivate yourself");
                                  return;
                                }
                                setConfirming({ student: s, action: "deactivate" });
                              }}
                            >
                              Deactivate
                            </MenuItem>
                          )}
                          {callerCanDelete && !isSelf && (
                            <>
                              <div className="h-px bg-[hsl(var(--rule))]" />
                              <MenuItem
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                destructive
                                onClick={() => {
                                  setOpenMenu(null);
                                  setConfirming({ student: s, action: "delete" });
                                }}
                              >
                                Delete
                              </MenuItem>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-[hsl(var(--fg-3))]">
                {query ? "No matches." : "No students yet — sign-ups will appear here."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editing && (
        <EditDialog
          student={editing}
          canChangeRole={callerCanManageRole}
          onClose={() => setEditing(null)}
        />
      )}

      {confirming && (
        <ConfirmDialog
          student={confirming.student}
          action={confirming.action}
          onClose={() => setConfirming(null)}
        />
      )}
    </>
  );
}

function MenuItem({
  children,
  icon,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[hsl(var(--bg-2))] ${
        destructive ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--fg-1))]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function EditDialog({
  student,
  canChangeRole,
  onClose,
}: {
  student: Student;
  canChangeRole: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [display_name, setDisplayName] = useState(student.display_name ?? "");
  const [email, setEmail] = useState(student.email);
  const [role, setRole] = useState(student.role);
  const [bio, setBio] = useState(student.bio ?? "");
  const [timezone, setTimezone] = useState(student.timezone ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await updateStudent(student.id, {
          display_name: display_name.trim() || null,
          email: email.trim(),
          role: canChangeRole ? (role as "student") : null,
          bio: bio.trim() || null,
          timezone: timezone.trim() || null,
        });
        if ((res as { warning?: string }).warning) {
          toast.warning((res as { warning: string }).warning);
        } else {
          toast.success("Student updated");
        }
        onClose();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  return (
    <ModalShell onClose={onClose} title="Edit student">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Full name</Label>
          <Input
            id="display_name"
            value={display_name}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-[11px] text-[hsl(var(--fg-3))]">
            Changing this updates both the login email and the profile.
          </p>
        </div>
        {canChangeRole && (
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 w-full rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] px-3 text-sm"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="America/New_York"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmDialog({
  student,
  action,
  onClose,
}: {
  student: Student;
  action: "delete" | "deactivate";
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const isDelete = action === "delete";

  const onConfirm = () => {
    startTransition(async () => {
      try {
        if (isDelete) {
          await deleteStudent(student.id);
          toast.success("Student deleted");
        } else {
          await deactivateStudent(student.id);
          toast.success("Student deactivated");
        }
        onClose();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  return (
    <ModalShell
      onClose={onClose}
      title={isDelete ? "Delete this student?" : "Deactivate this student?"}
    >
      <div className="space-y-4">
        <p className="text-[14px] text-[hsl(var(--fg-2))]">
          {isDelete ? (
            <>
              This will <strong>permanently remove</strong> {student.display_name ?? student.email}&apos;s
              account, all enrollments, progress, and assessments. This cannot be undone.
            </>
          ) : (
            <>
              {student.display_name ?? student.email} will be signed out and unable to sign back in.
              Their data is preserved — you can reactivate them at any time.
            </>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDelete ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isDelete ? (
              "Delete permanently"
            ) : (
              "Deactivate"
            )}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[hsl(var(--ink))]/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] shadow-2xl"
      >
        <div className="border-b-[0.5px] border-[hsl(var(--rule))] px-6 py-4">
          <h2 className="font-display text-[20px] font-medium">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
