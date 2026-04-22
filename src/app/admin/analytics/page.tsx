import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/vanguard";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <Eyebrow>Editorial Desk</Eyebrow>
        <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em]">
          Analytics
        </h1>
        <p className="mt-2 text-[14px] text-[hsl(var(--fg-3))]">
          Product usage, revenue, retention.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["DAU", "MRR", "Course completion", "Application conversion"].map((t, i) => (
          <Card key={t} variant="editorial">
            <CardHeader>
              <Eyebrow>
                №&nbsp;{String(i + 1).padStart(2, "0")}
              </Eyebrow>
              <CardTitle className="text-[22px]">{t}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end gap-[3px] border-b-[0.5px] border-[hsl(var(--rule))]">
                {Array.from({ length: 24 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex-1 bg-[hsl(var(--bg-inverse))]"
                    style={{
                      height: `${30 + Math.sin((j + i * 3) / 2.2) * 30 + j * 1.2}%`,
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
