import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";

export default function MentorshipPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-4xl">Mentorship</h1>
        <p className="mt-1 text-muted-foreground">
          Book sessions, review notes, track your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming sessions
            </CardTitle>
            <CardDescription>No sessions scheduled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="gradient">Book a session</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Past sessions
            </CardTitle>
            <CardDescription>Notes, recordings, action items.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your session history will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
