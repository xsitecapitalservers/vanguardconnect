"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  why: z.string().min(30, "Tell us a bit more (≥ 30 chars)"),
  goal_90_days: z.string().min(20, "What specifically? (≥ 20 chars)"),
  experience_years: z.coerce.number().min(0).max(60),
  commitment_hours_weekly: z.coerce.number().min(1).max(80),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ApplyForm({ programId }: { programId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      experience_years: 0,
      commitment_hours_weekly: 5,
      portfolio_url: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.info("Create an account to apply");
      router.push(`/signup?next=/programs/mentorship/apply`);
      return;
    }

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      program_id: programId,
      answers: values,
      stage: "submitted",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Application submitted 🎉");
    router.push("/portal/applications");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        label="Why this program? What's bringing you here?"
        error={errors.why?.message}
      >
        <textarea
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("why")}
        />
      </Field>

      <Field
        label="What do you want to achieve in 90 days?"
        error={errors.goal_90_days?.message}
      >
        <textarea
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("goal_90_days")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Years of experience" error={errors.experience_years?.message}>
          <Input type="number" min="0" {...register("experience_years")} />
        </Field>
        <Field label="Weekly commitment (hours)" error={errors.commitment_hours_weekly?.message}>
          <Input type="number" min="1" {...register("commitment_hours_weekly")} />
        </Field>
      </div>

      <Field label="Portfolio URL (optional)" error={errors.portfolio_url?.message}>
        <Input placeholder="https://…" {...register("portfolio_url")} />
      </Field>

      <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
