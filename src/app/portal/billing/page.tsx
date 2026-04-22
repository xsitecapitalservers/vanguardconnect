import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, course:courses(title)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-4xl">Billing</h1>
        <p className="mt-1 text-muted-foreground">Payment history and invoices.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => {
                const course = (order as { course: { title: string } | null }).course;
                return (
                  <div key={order.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{course?.title ?? "Program"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          order.status === "succeeded"
                            ? "success"
                            : order.status === "refunded"
                            ? "secondary"
                            : order.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                      <span className="font-mono text-sm">
                        {formatCurrency(order.amount_cents, order.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
