"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

/**
 * AuthGuard - Protects authenticated routes
 * Non-authenticated users are redirected to the landing page
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth is ready to avoid flash
    if (authReady && !session) {
      router.push("/");
    }
  }, [authReady, session, router]);

  // Show nothing while checking auth to prevent flash
  if (!authReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!session) {
    return null;
  }

  return <>{children}</>;
}
