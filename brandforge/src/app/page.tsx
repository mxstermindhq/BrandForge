import Link from "next/link";
import { ForgeCanvas } from "@/components/canvas/ForgeCanvas";
import { ForgeHeader } from "@/components/shell/ForgeHeader";
import { ForgeFooter } from "@/components/shell/ForgeFooter";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import { VOUCHES } from "@/content/home";
import { SITE } from "@/config/site";
import { SchemaInjector } from "@/components/content/SchemaInjector";
import { HOME_FAQ } from "@/content/home-sections";

const SHOWCASE = PORTFOLIO_PROJECTS.filter(
  (p) => p.status === "live" || p.status === "archived"
).slice(0, 6);

const REVIEWS = VOUCHES.slice(0, 6);

function HeroSection() {
  return (
    <section id="hero" className="relative z-10 min-h-[85vh] flex items-center pt-20 pb-16 sm:pb-20 overflow-hidden">
      <ForgeCanvas />
      <div className="content-wrap w-full">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent mb-4 sm:mb-5">
            Design · Development · Growth
          </p>
          <h1 className="text-[clamp(2.2rem,7vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.03em] text-text">
            Raw ideas forged into{" "}
            <span className="text-accent">battle-ready brands.</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-t2">
            You bring the vision. We assemble the squad — designers, engineers, and growth operators —
            and forge it into a live product. No intake forms, no sales calls. Fixed quote in 24 hours.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 sm:px-6 py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 hover:shadow-[0_0_24px_var(--a-mid)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>
              Join the Forge on Discord
            </a>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-amber/50 px-5 sm:px-6 py-3 text-sm font-bold text-amber transition-all hover:bg-amber/10 hover:border-amber"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Chat Directly on Telegram
            </a>
          </div>
        </div>
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 max-w-2xl">
          {[
            { value: "25+", label: "Projects delivered" },
            { value: "12", label: "Countries served" },
            { value: "14", label: "Verified vouches" },
            { value: "24h", label: "Quote turnaround" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative border border-b1/60 bg-s1/40 px-4 py-5 text-center"
            >
              <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <p className="text-2xl sm:text-3xl font-black text-text leading-none tracking-tight font-display">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[10px] sm:text-[11px] font-medium text-t2 uppercase tracking-[0.12em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  if (SHOWCASE.length === 0) return null;

  return (
    <section id="portfolio" className="relative z-10 py-20 sm:py-28">
      <div className="content-wrap">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
          Portfolio
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-text">
          Work we&apos;ve <span className="text-accent">shipped.</span>
        </h2>
        <p className="mt-2 text-sm text-t2 max-w-lg">
          Live products, not mockups. Every project was built from scope to production by the BrandForge squad.
        </p>

        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((project) => {
            const isArchived = project.status === "archived";
            return (
              <Link
                key={project.slug}
                href={`/portfolio/${project.slug}/`}
                className={`group relative flex flex-col overflow-hidden border border-b1/50 bg-s1/30 transition-all hover:border-b1 hover:bg-s1/50 ${
                  isArchived ? "opacity-70 grayscale hover:opacity-100 hover:grayscale-0" : ""
                }`}
              >
                <div
                  className="relative h-40 sm:h-44 flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${project.brandGradient[0]}, ${project.brandGradient[1]})`,
                  }}
                >
                  <span className="relative text-xs font-bold text-white/80 drop-shadow-sm px-4 text-center leading-relaxed">
                    {project.name}
                  </span>
                </div>
                <div className="flex flex-col flex-1 px-4 sm:px-5 py-4">
                  <div className="absolute top-0 left-0 w-8 h-8" style={{ background: `linear-gradient(135deg, ${project.brandGradient[0]}80, ${project.brandGradient[1]}20)` }} />
                  <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-muted">
                    {project.category}
                  </p>
                  <h3 className="mt-1.5 text-sm sm:text-base font-bold text-text group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-t2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="border border-b1/60 px-2 py-0.5 font-mono text-[8px] sm:text-[9px] text-t2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/portfolio/"
            className="inline-flex items-center gap-2 rounded-md border border-b2 px-5 py-3 text-sm font-bold text-text transition-all hover:border-accent hover:text-accent"
          >
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  if (REVIEWS.length === 0) return null;

  return (
    <section id="proof" className="relative z-10 py-20 sm:py-28">
      <div className="content-wrap">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
          Trusted by operators
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-text">
          Real clients, <span className="text-accent">real results.</span>
        </h2>

        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((v) => {
            const stars = "★".repeat(v.stars) + "☆".repeat(5 - v.stars);
            return (
              <div
                key={v.id}
                className="relative border border-b1/50 bg-s1/30 p-5 sm:p-6"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/80 via-accent/40 to-transparent" />
                <p className="text-amber/80 text-xs sm:text-sm tracking-wider">{stars}</p>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary">
                  &ldquo;{v.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2.5 border-t border-b1/30 pt-3">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center border border-accent/40 text-[10px] sm:text-xs font-bold text-accent">
                    {v.who.replace("@", "").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text">{v.who}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted">{v.from}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  if (HOME_FAQ.length === 0) return null;

  return (
    <section id="faq" className="relative z-10 py-20 sm:py-28">
      <div className="content-wrap max-w-2xl">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent mb-2 text-center">
          FAQ
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-text text-center">
          Straight <span className="text-accent">answers.</span>
        </h2>

        <div className="mt-8 sm:mt-10 space-y-3">
          {HOME_FAQ.map((faq, i) => (
            <details
              key={i}
              className="group rounded-lg border border-b1/60 bg-s1/40 backdrop-blur-sm transition-all open:border-accent/30 open:bg-s1/60"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 sm:px-5 py-4 text-sm sm:text-base font-semibold text-text list-none transition-colors hover:text-accent">
                {faq.question}
                <span className="ml-2 text-accent transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-t2 leading-relaxed border-t border-b1/40 pt-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="relative z-10 py-28 sm:py-40 border-t border-b1/40">
      <div className="content-wrap text-center">
        <div className="max-w-xl mx-auto">
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
            Ready to start?
          </p>
          <h2 className="text-[clamp(1.8rem,5vw,3.2rem)] font-bold leading-[1.08] text-text">
            Let&apos;s forge something{" "}
            <span className="text-accent">exceptional.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-t2 max-w-md mx-auto">
            Send your scope on Discord or Telegram. Fixed quote in 24 hours — no sales call, no commitment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-accent/90 hover:shadow-[0_0_32px_var(--a-mid)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>
              Join the Forge on Discord
            </a>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-amber/50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-amber transition-all hover:bg-amber/10 hover:border-amber"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Chat Directly on Telegram
            </a>
          </div>
          <p className="mt-4 text-[11px] sm:text-xs text-muted">
            Crypto and escrow accepted. No intake forms. No sales call required.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const reviews = VOUCHES.slice(0, 6).map((v) => ({
    author: v.who,
    text: v.text,
    rating: v.stars,
  }));

  return (
    <>
      <SchemaInjector
        pageType="home"
        path="/"
        breadcrumbs={[{ label: "Home", href: "/" }]}
        faqs={HOME_FAQ}
        reviews={reviews}
      />
      <div className="sr-only" aria-hidden>
        BrandForge is a design, development, and growth studio at brandforge.gg for digital founders
        and operators. Bespoke quotes — contact on Discord or Telegram. Crypto and escrow accepted.
      </div>

      <ForgeHeader />

      <main id="main" className="relative z-10">
        <HeroSection />
        <PortfolioSection />
        <SocialProofSection />
        <FAQSection />
        <ClosingCTA />
      </main>

      <ForgeFooter />
    </>
  );
}
