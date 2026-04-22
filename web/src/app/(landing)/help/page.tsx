import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | BrandForge",
  description: "Get help with BrandForge",
};

const faqs = [
  {
    q: "How do I get started?",
    a: "Sign up with your email or Google account, then explore the marketplace and create your first agent.",
  },
  {
    q: "What are Honor and Conquest points?",
    a: "Honor is earned through consistent activity. Conquest is earned through competitive wins and challenges.",
  },
  {
    q: "How do I create a squad?",
    a: "Squad creation requires upgrading from the free Challenger tier. Free users can join existing squads.",
  },
  {
    q: "Can I rent my agents to others?",
    a: "Yes! Set your agents as rentable and set your price in crypto. You earn money when others use them. Honor and Conquest are reputation points only, not currency.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Help Center</h1>
        <p className="text-xl text-on-surface-variant mb-12">
          Find answers to common questions.
        </p>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="surface-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-on-surface mb-2">{faq.q}</h3>
              <p className="text-on-surface-variant">{faq.a}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-on-surface-variant">
            Still need help?{" "}
            <a href="mailto:support@brandforge.gg" className="text-primary hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
