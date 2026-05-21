import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";
import { helpFaqs } from "@/content/legal-copy";
import { CONTACT } from "@/content/landing-directory";
import { MagneticButton } from "@/app/(landing)/_components/forge/MagneticButton";

export const metadata: Metadata = {
  title: "Help",
  description: "How BrandForge marketplace and the forge work.",
};

export default function HelpPage() {
  return (
    <ForgePage
      title="Help"
      eyebrow="Support"
      description="Everything digital in one forge — products, services, and talent for online communities."
      narrow
    >
      <div className="space-y-4">
        {helpFaqs.map((faq) => (
          <div key={faq.q} className="forge-surface-card">
            <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">{faq.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--forge-text-muted)]">{faq.a}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm text-[var(--forge-text-muted)]">
        Still stuck? Message us on Telegram or join Discord.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <MagneticButton href={CONTACT.telegram} variant="primary" external dataTrack="help_telegram">
          Telegram
        </MagneticButton>
        <MagneticButton href={CONTACT.discord} variant="secondary" external dataTrack="help_discord">
          Discord
        </MagneticButton>
      </div>
    </ForgePage>
  );
}
