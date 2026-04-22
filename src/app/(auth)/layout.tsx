import Link from "next/link";
import { VCBrand } from "@/components/ui/vanguard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--bg-2))] px-6 py-12 text-[hsl(var(--fg-1))]">
      <div className="pointer-events-none absolute inset-0 bg-noise" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          aria-label="Vanguard Connect"
          className="mb-10 flex items-center justify-center"
        >
          <VCBrand size="md" />
        </Link>
        {children}
      </div>
    </div>
  );
}
