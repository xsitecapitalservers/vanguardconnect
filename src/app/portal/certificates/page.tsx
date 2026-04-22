import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-4xl">Certificates</h1>
        <p className="mt-1 text-muted-foreground">
          Earn verifiable credentials as you complete courses.
        </p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <Award className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Complete your first course to earn a certificate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
