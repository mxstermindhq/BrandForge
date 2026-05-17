import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { LandingNav } from "./_components/LandingNav";
import { LandingUIProvider } from "./_components/LandingUIProvider";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--landing-font-headline",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--landing-font-body",
  display: "swap",
});

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
        <div className={`landing-layout ${cormorant.variable} ${dmSans.variable}`}>
          <LandingNav />
          <div className="pt-16">{children}</div>
        </div>
      </LandingUIProvider>
    </SmoothScrollProvider>
  );
}
