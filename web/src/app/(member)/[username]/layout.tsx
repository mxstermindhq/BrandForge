import { ForgeSiteShell } from "@/app/(landing)/_components/forge/ForgeSiteShell";
import { LandingUIProvider } from "@/app/(landing)/_components/LandingUIProvider";

export default function MemberProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingUIProvider>
      <ForgeSiteShell subtleBg>{children}</ForgeSiteShell>
    </LandingUIProvider>
  );
}
