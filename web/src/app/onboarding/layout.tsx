import { ForgeSiteShell } from "@/app/(landing)/_components/forge/ForgeSiteShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ForgeSiteShell subtleBg>
      <OnboardingGate />
      {children}
    </ForgeSiteShell>
  );
}
