import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press | BrandForge",
  description: "BrandForge press kit and media resources",
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Press</h1>
        <p className="text-xl text-on-surface-variant mb-12">
          Media resources and brand assets for press coverage.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="surface-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-on-surface mb-2">Brand Assets</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              Logos, colors, and brand guidelines for press use.
            </p>
            <button className="text-primary text-sm hover:underline">Download Kit</button>
          </div>
          
          <div className="surface-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-on-surface mb-2">Media Inquiries</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              Contact our press team for interviews and features.
            </p>
            <a href="mailto:press@brandforge.ai" className="text-primary text-sm hover:underline">
              press@brandforge.ai
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
