import type { Metadata } from "next";
import { ForgeLayoutRouter } from "./_components/forge/ForgeLayoutRouter";
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
        <ForgeLayoutRouter>{children}</ForgeLayoutRouter>
      </LandingUIProvider>
    </SmoothScrollProvider>
  );
}
