import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "About",
  description: "BrandForge — the forge for digital products and services",
};

export default function AboutPage() {
  return (
    <ForgePage
      title="About BrandForge"
      eyebrow="The forge"
      description="Amazon for digital services and digital products — one stellar furnace for everything your project needs."
      narrow
    >
      <div className="forge-prose">
        <p>
          BrandForge is where founders, creators, and communities source design, AI systems, growth, developers,
          bots, templates, and digital products — without wading through generic agency sites or proposal spam.
        </p>
        <h2>What we forge</h2>
        <p>
          Products you can buy now. Services with clear delivery windows. Vetted talent when you need a human in
          the loop. All routed with direct communication and fast turnaround.
        </p>
        <h2>Sister brand</h2>
        <p>
          BrandForge is fire — creation, energy, action. Our sister brand{" "}
          <a href="https://mxstermind.com" target="_blank" rel="noopener noreferrer">
            Mxstermind
          </a>{" "}
          is water — intelligence, space, calm. Same typography and interaction system; different elemental identity.
        </p>
        <h2>How to start</h2>
        <p>Browse the marketplace, pick what fits, message on Discord or Telegram, receive. That simple.</p>
      </div>
    </ForgePage>
  );
}
