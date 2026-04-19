"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  LoginHero,
  WorldOfBrandForge,
  FeaturesGrid,
  HowItWorks,
  AskAICards,
  PlansShowcase,
  FAQSection,
  LandingFooter,
} from "../_components";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    // Store selected plan in localStorage for post-auth redirect
    if (plan) {
      localStorage.setItem("selected_plan", plan);
    }
  }, [plan]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* LOGIN HERO - Split layout with form on left, image on right */}
      <section id="login" className="relative min-h-screen">
        <LoginHero selectedPlan={plan} />
      </section>

      {/* PRODUCT - Core offering */}
      <section id="product" className="relative border-t border-zinc-800">
        <FeaturesGrid />
      </section>

      {/* EXPLORE THE WORLD */}
      <section className="relative border-t border-zinc-800">
        <WorldOfBrandForge />
      </section>

      {/* SOLUTION - How it works */}
      <section id="how-it-works" className="relative border-t border-zinc-800">
        <HowItWorks />
      </section>

      {/* SOCIAL PROOF - Ask AI */}
      <section className="relative border-t border-zinc-800">
        <AskAICards />
      </section>

      {/* PRICING - Plans */}
      <section id="pricing" className="relative border-t border-zinc-800">
        <PlansShowcase selectedPlan={plan} />
      </section>

      {/* FAQ */}
      <section id="faq" className="relative border-t border-zinc-800">
        <FAQSection />
      </section>

      {/* FOOTER */}
      <LandingFooter />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
