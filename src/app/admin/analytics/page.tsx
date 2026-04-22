import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Product usage, revenue, retention.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["DAU", "MRR", "Course completion", "Application conversion"].map((t) => (
          <Card key={t}>
            <CardHeader>
              <CardTitle className="text-sm">{t}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
