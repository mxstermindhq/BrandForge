import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AiDevelopmentShell } from "./AiDevelopmentShell";

export const metadata: Metadata = {
  title: "AI",
  robots: { index: false, follow: false },
};

export default function AiLayout({ children }: { children: ReactNode }) {
  void children;
  return <AiDevelopmentShell />;
}
