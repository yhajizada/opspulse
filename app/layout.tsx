import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "OpsPulse | Enterprise Incident Response & Service Reliability Platform",
  description:
    "Mission-critical incident management, intelligent alert deduplication, on-call rotation scheduling, and SLO error budget governance.",
  keywords: [
    "incident management",
    "on-call scheduling",
    "SRE",
    "SLO",
    "error budget",
    "alert deduplication",
    "post-mortem",
    "PagerDuty alternative",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
