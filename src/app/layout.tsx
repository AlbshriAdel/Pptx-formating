import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLO Tracker",
  description: "Course Learning Outcomes Tracker — NCAAA Standard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
