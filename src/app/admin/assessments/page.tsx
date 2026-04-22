import { Card, CardContent } from "@/components/ui/card";
import { FileCheck2 } from "lucide-react";

export default function AssessmentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Assessments</h1>
        <p className="mt-1 text-muted-foreground">Question bank, grading queue, rubrics.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <FileCheck2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Assessments module lands in Phase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
