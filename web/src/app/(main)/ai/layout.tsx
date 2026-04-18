import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Tools | BrandForge",
  description: "AI-powered tools for BrandForge - Brief generator, proposal writer, and contract review.",
  openGraph: { url: "https://brandforge.gg/ai" },
};

export default function AiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
