import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | BrandForge",
  description: "BrandForge cookie policy",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-8">Cookie Policy</h1>
        
        <div className="prose max-w-none text-on-surface-variant">
          <p className="mb-6">Last updated: April 2026</p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you 
            visit a website. They are widely used to make websites work more efficiently.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">2. How We Use Cookies</h2>
          <p className="mb-4">
            BrandForge uses cookies to keep you signed in, remember your preferences, 
            and understand how you use our platform.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">3. Managing Cookies</h2>
          <p className="mb-4">
            Most web browsers allow you to control cookies through their settings. You can usually 
            find these settings in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser.
          </p>
          
          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-4">4. Contact</h2>
          <p>
            If you have questions about our Cookie Policy, contact us at{" "}
            <a href="mailto:hello@brandforge.gg" className="text-primary hover:underline">
              hello@brandforge.gg
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
