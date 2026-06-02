"use client";

import { CopyButton, PageHero, PageShell } from "@/components/content";

const colors = [
  { name: "Background", hex: "#060608", rgb: "6, 6, 8", hsl: "240, 10%, 3%" },
  { name: "Surface 1", hex: "#0b0b0f", rgb: "11, 11, 15", hsl: "240, 14%, 5%" },
  { name: "Accent", hex: "#7c3aed", rgb: "124, 58, 237", hsl: "263, 84%, 58%" },
  { name: "Accent bright", hex: "#9d5fff", rgb: "157, 95, 255", hsl: "263, 100%, 69%" },
  { name: "Text", hex: "#e2e0ea", rgb: "226, 224, 234", hsl: "250, 14%, 90%" },
] as const;

const heroes = [
  "Ship the brand. Skip the agency theatre.",
  "Fixed quote in 24h. Discord delivery.",
  "Look funded before you are big.",
  "Nine disciplines. One invoice.",
  "Built for forum operators and Web3 founders.",
] as const;

const faqs = [
  {
    question: "Can I use BrandForge tokens on my project?",
    answer:
      "Yes for operator brands we build. Do not impersonate BrandForge itself — use your own marks.",
  },
  {
    question: "Where are fonts defined?",
    answer: "Space Grotesk display, Space Mono labels — loaded in site layout.",
  },
  {
    question: "Copy templates for what?",
    answer: "Hero lines, bios, Discord/Telegram descriptions, social and portfolio captions.",
  },
  {
    question: "mxstermind tokens?",
    answer: "Warm gold editorial system lives on mxstermind.com — not mixed with BrandForge purple.",
  },
] as const;

function TokenRow({
  name,
  hex,
  rgb,
  hsl,
}: {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
}): React.JSX.Element {
  const block = `${name}\nHEX ${hex}\nRGB ${rgb}\nHSL ${hsl}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-b1 bg-s1 p-4">
      <div>
        <p className="font-bold text-text">{name}</p>
        <p className="mt-1 font-mono text-[10px] text-muted">
          {hex} · rgb({rgb}) · hsl({hsl})
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded border border-b1" style={{ background: hex }} />
        <CopyButton text={block} label="Copy" />
      </div>
    </div>
  );
}

export function BrandGuideClient(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Brand guide", href: "/brand-guide/" },
      ]}
      path="/brand-guide/"
      faqs={faqs}
    >
      <PageHero
        eyebrow="Brand guide"
        title="Design system & copy library"
        subhead="Tokens, voice rules, and templates with one-click copy."
      />

      <section className="py-12">
        <div className="content-wrap space-y-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Colour system
          </h2>
          {colors.map((c) => (
            <TokenRow key={c.hex} {...c} />
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="content-wrap space-y-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Hero variants
          </h2>
          {heroes.map((h) => (
            <div key={h} className="flex justify-between gap-4 rounded-md border border-b1 p-4">
              <p className="text-sm text-text">{h}</p>
              <CopyButton text={h} />
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Discord server description
          </h2>
          <div className="mt-4">
            <CopyButton
              text={`BrandForge — design, dev & growth for operators. Fixed USD quotes in 24h.\nPackages: brandforge.gg/packages\nStart: discord.gg/a8Nz2R6M55`}
              label="Copy description"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
