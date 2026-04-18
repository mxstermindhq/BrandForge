import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BrandForge",
  description: "BrandForge privacy policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none text-on-surface-variant">
          <p className="mb-6">Last updated: April 2026</p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, including your name, email address, 
            profile information, and any content you create or share on BrandForge.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use your information to provide, maintain, and improve our services, communicate with you, 
            and personalize your experience on BrandForge.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share information with service providers 
            who assist us in operating our platform.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information from 
            unauthorized access, alteration, or destruction.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:hello@brandforge.gg" className="text-primary hover:underline">
              hello@brandforge.gg
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
