import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Announcements</h1>
        <p className="mt-1 text-muted-foreground">Push updates to cohorts or the whole platform.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Compose coming in Phase 4.</p>
        </CardContent>
      </Card>
    </div>
  );
}
