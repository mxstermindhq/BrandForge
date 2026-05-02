import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | BrandForge",
  description: "BrandForge terms of service",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link href="/" className="inline-block mb-8 text-sm text-zinc-400 hover:text-white transition">
          ← Back to BrandForge
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-zinc-400 mb-8">Last updated: May 2026</p>
        
        <div className="prose prose-invert max-w-none text-zinc-300">
          <p className="mb-6">
            Welcome to BrandForge ("the Platform"), a professional marketplace connecting clients with verified specialists. 
            By accessing or using BrandForge, you agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these terms, please do not use our services.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By creating an account or using BrandForge, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
            We reserve the right to modify these terms at any time, and your continued use of the Platform constitutes acceptance of any changes.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years old to use BrandForge. By using our services, you represent and warrant that you meet this requirement 
            and have the legal capacity to enter into binding agreements.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Account Responsibilities</h2>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Platform Services</h2>
          <p className="mb-4">
            BrandForge provides a marketplace for clients to post service requests and for specialists to offer their services. 
            The Platform includes features such as escrow-secured payments, AI-assisted brief generation, and deal room communication tools.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Escrow and Payments</h2>
          <p className="mb-4">
            All payments through BrandForge are held in escrow until project milestones are completed and approved. 
            Platform fees are deducted from the total project value before funds are released to the specialist. 
            The escrow mechanism is designed to protect both clients and specialists.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. User Conduct</h2>
          <p className="mb-4">
            You agree to use BrandForge only for lawful purposes. Prohibited activities include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Posting fraudulent or misleading service requests</li>
            <li>Misrepresenting your skills, qualifications, or experience</li>
            <li>Attempting to circumvent the escrow payment system</li>
            <li>Harassing, abusing, or threatening other users</li>
            <li>Violating intellectual property rights of others</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Intellectual Property</h2>
          <p className="mb-4">
            BrandForge and its original content, features, and functionality are owned by BrandForge and are protected by intellectual property laws. 
            You retain ownership of your profile content, portfolio items, and communications, but grant BrandForge a license to use such content 
            to provide the Platform services.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Dispute Resolution</h2>
          <p className="mb-4">
            In the event of a dispute between a client and specialist, BrandForge may offer mediation services. 
            Escrowed funds may be held pending resolution of disputes. BrandForge reserves the right to make final determinations 
            on disputes based on available evidence.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account immediately for any reason, including but not limited to breach of these Terms, 
            fraudulent activity, or violation of our community guidelines. Upon termination, you lose access to your account and all associated data.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="mb-4">
            BrandForge is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. 
            Our total liability to you for all claims shall not exceed the amount you paid to use the Platform in the twelve months preceding the claim.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. Privacy</h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our <Link href="/privacy" className="text-amber-400 hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">12. Governing Law</h2>
          <p className="mb-4">
            These Terms are governed by the laws of the jurisdiction in which BrandForge operates. Any disputes shall be resolved in the courts of that jurisdiction.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">13. Contact</h2>
          <p>
            Questions about the Terms should be sent to{" "}
            <a href="mailto:legal@brandforge.gg" className="text-amber-400 hover:underline">
              legal@brandforge.gg
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
