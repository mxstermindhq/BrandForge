import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BrandForge",
  description: "BrandForge terms of service",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose max-w-none text-zinc-400">
          <p className="mb-6">Last updated: April 2026</p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using BrandForge, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years old to use BrandForge. By using our services, you represent 
            and warrant that you meet this requirement.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. User Conduct</h2>
          <p className="mb-4">
            You agree to use BrandForge only for lawful purposes and in accordance with these Terms. 
            You may not use our platform to engage in any harmful or fraudulent activities.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Intellectual Property</h2>
          <p className="mb-4">
            BrandForge and its original content, features, and functionality are owned by BrandForge 
            and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account immediately, without prior notice or liability, 
            for any reason, including breach of these Terms.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Contact</h2>
          <p>
            Questions about the Terms should be sent to{" "}
            <a href="mailto:legal@brandforge.ai" className="text-amber-400 hover:underline">
              legal@brandforge.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
