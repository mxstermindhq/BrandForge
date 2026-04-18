"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to BrandForge",
    description: "The professional OS for the AI era. Let's take a quick tour of your new workspace.",
    target: null, // Center modal
  },
  {
    id: "marketplace",
    title: "The Marketplace",
    description: "Offer your services or request what you need. Our AI Smart Match engine connects buyers and sellers instantly.",
    target: "[href='/marketplace']",
  },
  {
    id: "chat",
    title: "AI-Powered Chat",
    description: "Chat with deal rooms and your AI assistant. Get contract help, analysis, and summaries on demand.",
    target: "[href='/chat']",
  },
  {
    id: "ai-tools",
    title: "AI Tools",
    description: "Generate professional briefs and proposals with AI. Deploy agents and squads to execute projects.",
    target: "[href='/ai']",
  },
  {
    id: "arena",
    title: "The Arena",
    description: "Earn Honor, Conquest, and RP through successful deals. Rank up from Challenger to Undisputed.",
    target: "[href='/leaderboard']",
  },
  {
    id: "complete",
    title: "You're Ready!",
    description: "Start exploring the World of BrandForge. Offer a service, post a request, or browse the marketplace.",
    target: null,
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is new (first login)
    const hasCompletedOnboarding = localStorage.getItem("bf-onboarding-complete");
    const isAuthenticated = localStorage.getItem("bf-session"); // Or check via auth context
    
    if (!hasCompletedOnboarding && isAuthenticated && pathname === "/dashboard") {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setIsOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skipOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem("bf-onboarding-complete", "true");
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem("bf-onboarding-complete", "true");
    setCurrentStep(0);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        totalSteps: ONBOARDING_STEPS.length,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
      }}
    >
      {children}
      {isOnboarding && <OnboardingTooltip />}
    </OnboardingContext.Provider>
  );
}

function OnboardingTooltip() {
  const { currentStep, totalSteps, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const step = ONBOARDING_STEPS[currentStep];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        setHighlightStyle({
          position: "fixed",
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          borderRadius: 8,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 0 2px #4f8ef7",
          pointerEvents: "none",
          zIndex: 9998,
          transition: "all 0.3s ease",
        });
      }
    } else {
      setTargetRect(null);
      setHighlightStyle({});
    }
  }, [step, currentStep]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Backdrop with highlight */}
      {step.target && targetRect && (
        <div style={highlightStyle as React.CSSProperties} />
      )}
      
      {/* Full backdrop for modal steps */}
      {!step.target && (
        <div className="fixed inset-0 bg-black/70 z-[9998]" />
      )}

      {/* Tooltip Card */}
      <div
        className={cn(
          "fixed z-[9999] w-[320px] surface-card p-5 shadow-2xl",
          !step.target && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={
          step.target && targetRect
            ? {
                left: targetRect.right + 16,
                top: Math.min(targetRect.top, window.innerHeight - 300),
              }
            : {}
        }
      >
        {/* Progress */}
        <div className="flex items-center gap-1 mb-4">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                idx <= currentStep ? "bg-primary" : "bg-surface-container-high"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipOnboarding}
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="btn-secondary px-3 py-2 text-sm"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="btn-primary px-3 py-2 text-sm"
            >
              {isLastStep ? "Get Started" : "Next"}
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <p className="text-center text-xs text-on-surface-variant mt-4">
          {currentStep + 1} of {totalSteps}
        </p>
      </div>
    </>
  );
}

// Hook to manually trigger onboarding (for testing or "Restart Tour")
export function useOnboardingTrigger() {
  const [isOnboarding, setIsOnboarding] = useState(false);

  const startOnboarding = () => {
    localStorage.removeItem("bf-onboarding-complete");
    setIsOnboarding(true);
    window.location.href = "/dashboard";
  };

  return { startOnboarding, isOnboarding };
}
