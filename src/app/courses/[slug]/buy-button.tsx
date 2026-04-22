"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function BuyButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.status === 401) {
        toast.info("Sign in to purchase");
        router.push(`/login?next=/courses`);
        return;
      }
      const { url, error } = await res.json();
      if (error) {
        toast.error(error);
        return;
      }
      if (url) window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="xl"
      variant="gradient"
      className="mt-4 w-full"
      onClick={handleBuy}
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Enroll now"}
    </Button>
  );
}
