import type { Metadata } from "next";
import { LandingNav } from "./_components/LandingNav";

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
    <div className="landing-layout scroll-smooth">
      <LandingNav />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
