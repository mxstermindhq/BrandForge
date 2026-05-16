import { LandingNav } from "@/app/(landing)/_components/LandingNav";
import { LandingUIProvider } from "@/app/(landing)/_components/LandingUIProvider";
import { LandingFooter } from "@/app/(landing)/_components/LandingFooter";

export default function MemberProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingUIProvider>
      <div className="min-h-screen bg-background text-on-surface">
        <LandingNav />
        <div className="pt-16">{children}</div>
        <LandingFooter />
      </div>
    </LandingUIProvider>
  );
}
