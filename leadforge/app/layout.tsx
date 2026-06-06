import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadForge — AI-enriched lead generation",
  description:
    "Describe your ideal customer, pick your sources, and receive AI-enriched leads with emails, fit scores, and pitch angles — ready to contact and export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
