"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export function FinalCTA() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  async function onStartJourney() {
    try {
      await signInWithGoogle();
    } catch {
      router.push("/login");
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold text-on-surface mb-6">
          Your next client is already on BrandForge.
        </h2>

        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10">
          Start free. Build a verified record. Keep what you earn.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onStartJourney} className="btn-primary min-h-14 px-8 text-lg">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">login</span>
              Get started — free
            </span>
          </button>
          <a href="mailto:sales@brandforge.gg" className="btn-secondary min-h-14 px-8 text-lg">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">support_agent</span>
              Talk to the team
            </span>
          </a>
        </div>

        {/* Trust line */}
        <p className="mt-12 text-sm text-on-surface-variant/70">
          Join in under 60 seconds · 1,200+ deals closed this month
        </p>
      </div>
    </section>
  );
}
