import type { Metadata } from "next";
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
      <LandingUIProvider>{children}</LandingUIProvider>
    </SmoothScrollProvider>
  );
}
