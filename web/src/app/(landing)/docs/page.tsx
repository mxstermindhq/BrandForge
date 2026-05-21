import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "Documentation",
  description: "BrandForge marketplace guides",
};

const sections = [
  {
    title: "Getting started",
    items: ["Browse the forge", "Pick a product or service", "Message & receive"],
  },
  {
    title: "For buyers",
    items: ["Discord & Telegram checkout", "Delivery windows", "Revisions & scope"],
  },
  {
    title: "For sellers",
    items: ["List a service", "Operator profiles", "Pricing & packages"],
  },
  {
    title: "Categories",
    items: ["AI systems", "Discord growth", "Brand & landing", "Developers", "Digital products"],
  },
];

export default function DocsPage() {
  return (
    <ForgePage title="Documentation" eyebrow="Guides" description="How to use the BrandForge marketplace." narrow>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="forge-surface-card">
            <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--forge-text-muted)]">
              {section.items.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ForgePage>
  );
}
