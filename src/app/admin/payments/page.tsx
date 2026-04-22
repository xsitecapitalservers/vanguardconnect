import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, user:profiles!orders_user_id_fkey(display_name, email), course:courses(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Payments</h1>
        <p className="mt-1 text-muted-foreground">Orders, subscriptions, refunds.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Course</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(orders ?? []).map((o) => {
                const user = (o as { user: { display_name: string | null; email: string } | null }).user;
                const course = (o as { course: { title: string } | null }).course;
                return (
                  <tr key={o.id} className="text-sm transition-colors hover:bg-accent/40">
                    <td className="px-6 py-4">{user?.display_name ?? user?.email ?? "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{course?.title ?? "Program"}</td>
                    <td className="px-6 py-4 font-mono">{formatCurrency(o.amount_cents, o.currency)}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          o.status === "succeeded"
                            ? "success"
                            : o.status === "refunded"
                            ? "secondary"
                            : o.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatRelativeTime(o.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(!orders || orders.length === 0) && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
