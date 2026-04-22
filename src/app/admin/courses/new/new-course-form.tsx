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
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3, "Title required"),
  subtitle: z.string().max(180).optional(),
  price: z.coerce.number().min(0, "Must be ≥ 0"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

type FormValues = z.infer<typeof schema>;

export function NewCourseForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: "beginner" },
  });

  const onSubmit = async (values: FormValues) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: values.title,
        subtitle: values.subtitle ?? null,
        slug: slugify(values.title),
        price_cents: Math.round(values.price * 100),
        difficulty: values.difficulty,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Course created");
    router.push(`/admin/courses/${data.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Advanced Strategy Foundations" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" placeholder="A one-line promise" {...register("subtitle")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            {...register("difficulty")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
