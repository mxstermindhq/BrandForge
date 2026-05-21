import { ForgeSiteShell } from "@/app/(landing)/_components/forge/ForgeSiteShell";
import { LandingUIProvider } from "@/app/(landing)/_components/LandingUIProvider";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <LandingUIProvider>
        <ForgeSiteShell subtleBg>{children}</ForgeSiteShell>
      </LandingUIProvider>
    </SmoothScrollProvider>
  );
}
