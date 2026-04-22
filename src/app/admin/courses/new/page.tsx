import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewCourseForm } from "./new-course-form";

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">New course</h1>
        <p className="mt-1 text-muted-foreground">Start with the basics — you can add modules and lessons next.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
