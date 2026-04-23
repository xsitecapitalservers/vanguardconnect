import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vanguard Connect — The Vanguard School of Multifamily Investing",
    template: "%s · Vanguard Connect",
  },
  description:
    "The Vanguard School of Multifamily Investing — a composed, cohort-based education platform for serious operators. Curriculum, cohort, coaches, and credentials in one considered room.",
  openGraph: {
    type: "website",
    siteName: "Vanguard Connect",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${editorial.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" closeButton theme="light" />
        </Providers>
      </body>
    </html>
  );
}
