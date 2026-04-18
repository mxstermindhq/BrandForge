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
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant mb-8">
          <span className="material-symbols-outlined text-amber-400 text-sm">emoji_events</span>
          <span className="text-sm font-body text-on-surface-variant">
            Join thousands of professionals already competing
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold text-on-surface mb-6">
          Ready to Enter the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Arena
          </span>
          ?
        </h2>

        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10">
          Your journey from Challenger to Undisputed starts with a single click. 
          Join the World of BrandForge today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onStartJourney} className="btn-primary min-h-14 px-8 text-lg">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">login</span>
              Start Your Journey
            </span>
          </button>
          <a href="#features" className="btn-secondary min-h-14 px-8 text-lg">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">explore</span>
              Explore Features
            </span>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-on-surface-variant/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success">verified</span>
            <span className="text-sm">Secure Escrow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success">verified</span>
            <span className="text-sm">AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success">verified</span>
            <span className="text-sm">Smart Contracts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
