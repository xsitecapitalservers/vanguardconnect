import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  courseId: z.string().uuid().optional(),
  programId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { courseId, programId } = parsed.data;
  if (!courseId && !programId) {
    return NextResponse.json({ error: "courseId or programId required" }, { status: 400 });
  }

  let priceCents = 0;
  let productName = "Vanguard program";
  let stripePriceId: string | null = null;

  if (courseId) {
    const { data: course } = await supabase
      .from("courses")
      .select("title, price_cents, stripe_price_id")
      .eq("id", courseId)
      .single();
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    priceCents = course.price_cents;
    productName = course.title;
    stripePriceId = course.stripe_price_id;
  }

  const stripe = getStripe();
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      stripePriceId
        ? { price: stripePriceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              product_data: { name: productName },
              unit_amount: priceCents,
            },
            quantity: 1,
          },
    ],
    customer_email: user.email!,
    metadata: {
      user_id: user.id,
      course_id: courseId ?? "",
      program_id: programId ?? "",
    },
    success_url: `${origin}/portal/courses?purchase=success`,
    cancel_url: `${origin}/courses?purchase=cancelled`,
  });

  // Record pending order
  await supabase.from("orders").insert({
    user_id: user.id,
    course_id: courseId ?? null,
    program_id: programId ?? null,
    amount_cents: priceCents,
    currency: "USD",
    status: "pending",
    stripe_checkout_session_id: session.id,
  });

  return NextResponse.json({ url: session.url });
}
