"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { Lock, ArrowRight, Info } from "lucide-react";

interface AuthWallProps {
  feature: string;
  preview: ReactNode;
  children: ReactNode;
  ctaText?: string;
}

export function AuthWall({ feature, preview, children, ctaText }: AuthWallProps) {
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  if (session) {
    return <>{children}</>;
  }

  const handleSignIn = () => {
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  };

  const handleHowItWorks = () => {
    setShowHowItWorks(true);
    setTimeout(() => {
      const howItWorksSection = document.getElementById("how-it-works");
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="relative">
      {/* Preview content */}
      <div className="relative">
        {preview}
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
      </div>

      {/* Auth wall overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-semibold text-on-surface mb-2">
            You're one step away
          </h3>

          {/* Feature name */}
          <p className="text-lg font-medium text-primary mb-2">
            {feature}
          </p>

          {/* Subtext */}
          <p className="text-sm text-on-surface-variant mb-6">
            Sign in free — no credit card needed
          </p>

          {/* CTA Button */}
          <button
            onClick={handleSignIn}
            className="w-full bg-foreground text-background hover:opacity-90 transition-opacity rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2 mb-3"
          >
            {ctaText || "Sign in to continue"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* How it works */}
          <button
            onClick={handleHowItWorks}
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <Info className="w-4 h-4" />
            See how it works
          </button>
        </div>
      </div>
    </div>
  );
}
