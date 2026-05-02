import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | BrandForge",
  description: "BrandForge privacy policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link href="/" className="inline-block mb-8 text-sm text-zinc-400 hover:text-white transition">
          ← Back to BrandForge
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-zinc-400 mb-8">Last updated: May 2026</p>
        
        <div className="prose prose-invert max-w-none text-zinc-300">
          <p className="mb-6">
            BrandForge ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect the following types of information:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, username, password, and profile details</li>
            <li><strong>Profile Information:</strong> Bio, skills, portfolio items, availability status, and professional background</li>
            <li><strong>Payment Information:</strong> Processed securely through Stripe; we do not store full card numbers</li>
            <li><strong>Communication Data:</strong> Messages, deal room chats, and notifications</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, and time spent on the platform</li>
            <li><strong>Device Information:</strong> IP address, browser type, and operating system</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide and maintain our marketplace services</li>
            <li>Process payments and manage escrow transactions</li>
            <li>Facilitate communication between clients and specialists</li>
            <li>Verify user identities and prevent fraud</li>
            <li>Send notifications about deals, messages, and platform updates</li>
            <li>Improve our services and develop new features</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Information Sharing</h2>
          <p className="mb-4">We do not sell your personal information. We may share information in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>With Other Users:</strong> Your profile information, portfolio, and reviews are visible to other platform users</li>
            <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform (e.g., Stripe for payments, Supabase for database hosting)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures including encryption, secure servers, and access controls to protect your information. 
            However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as necessary to provide our services and comply with legal obligations. 
            You may request deletion of your account and associated data at any time through your settings.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data</li>
            <li>Object to certain data processing activities</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies to improve your experience, analyze usage patterns, and authenticate your session. 
            You can manage cookie preferences through your browser settings.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Third-Party Services</h2>
          <p className="mb-4">
            Our platform integrates with third-party services including social login providers (Google, LinkedIn, Twitter) and payment processors (Stripe). 
            These services have their own privacy policies that we encourage you to review.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. Children's Privacy</h2>
          <p className="mb-4">
            BrandForge is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our platform 
            and updating the "Last updated" date.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at{" "}
            <a href="mailto:privacy@brandforge.gg" className="text-amber-400 hover:underline">
              privacy@brandforge.gg
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
