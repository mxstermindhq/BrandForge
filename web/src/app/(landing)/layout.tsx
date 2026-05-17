import type { Metadata } from "next";
import { LandingNav } from "./_components/LandingNav";
import { LandingUIProvider } from "./_components/LandingUIProvider";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScrollProvider>
      <LandingUIProvider>
        <div className="landing-layout">
          <LandingNav />
          <div className="pt-16">{children}</div>
        </div>
      </LandingUIProvider>
    </SmoothScrollProvider>
  );
}
