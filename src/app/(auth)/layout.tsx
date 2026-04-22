import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-spotlight" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-brand-700" />
          <span className="font-display text-2xl">Vanguard</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
