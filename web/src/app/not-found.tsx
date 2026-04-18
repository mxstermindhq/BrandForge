import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | BrandForge",
  description: "The page you're looking for doesn't exist. Return to the World of BrandForge.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">search_off</span>
          </div>
        </div>

        {/* 404 Code */}
        <h1 className="text-8xl sm:text-9xl font-headline font-bold text-on-surface mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-headline font-semibold text-on-surface mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-lg text-on-surface-variant mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Return to the World of BrandForge and continue your journey.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-primary px-8 py-3 text-base w-full sm:w-auto"
          >
            <span className="material-symbols-outlined mr-2">home</span>
            Return Home
          </Link>

          <Link
            href="/marketplace"
            className="btn-secondary px-8 py-3 text-base w-full sm:w-auto"
          >
            <span className="material-symbols-outlined mr-2">storefront</span>
            Explore Marketplace
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-outline-variant">
          <p className="text-sm text-on-surface-variant mb-4">
            Popular destinations:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-primary hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              href="/chat"
              className="text-primary hover:underline"
            >
              Chat
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              href="/squads"
              className="text-primary hover:underline"
            >
              Squads
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              href="/help"
              className="text-primary hover:underline"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
