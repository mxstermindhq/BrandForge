import { LandingNav } from "@/app/(landing)/_components/LandingNav";
import { LandingUIProvider } from "@/app/(landing)/_components/LandingUIProvider";
import { LandingFooter } from "@/app/(landing)/_components/LandingFooter";

export default function MemberProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingUIProvider>
      <div className="landing-layout min-h-screen bg-background pb-28 text-on-surface md:pb-24">
        <LandingNav />
        <div className="pt-16">{children}</div>
        <LandingFooter />
      </div>
    </LandingUIProvider>
  );
}
