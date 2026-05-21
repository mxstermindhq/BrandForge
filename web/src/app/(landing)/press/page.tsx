import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "Press",
  description: "BrandForge press kit",
};

export default function PressPage() {
  return (
    <ForgePage title="Press" eyebrow="Media" description="Brand assets and story for coverage." narrow>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="forge-surface-card">
          <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">Brand assets</h2>
          <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
            Logos, forge colors (fire / molten / gold on black metal), and usage guidelines.
          </p>
          <p className="mt-4 text-sm text-[var(--forge-gold)]">press@brandforge.gg</p>
        </div>
        <div className="forge-surface-card">
          <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">Story</h2>
          <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
            BrandForge is the marketplace for digital products and services — sister brand to Mxstermind intelligence
            layer.
          </p>
        </div>
      </div>
    </ForgePage>
  );
}
