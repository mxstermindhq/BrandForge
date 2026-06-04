import Link from "next/link";
import {
  DELIVERY_ROWS,
  GUARANTEE_ITEMS,
  ICP_CARDS,
  INTAKE_CHECKLIST,
  LIVE_PROJECT_URLS,
  PACKAGE_TIER_COLUMNS,
  PROCESS_STEPS,
  SUPPORT_CARDS,
} from "@/content/home-sections";
import { SITE } from "@/config/site";

function SectionEyebrow({ children }: { children: string }): React.JSX.Element {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">{children}</p>
  );
}

function SectionTitle({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <h2
      id={id}
      className="mt-3 text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-tight"
    >
      {children}
    </h2>
  );
}

export function LiveStripSection(): React.JSX.Element {
  return (
    <aside
      className="border-y border-b1 bg-s1 py-4"
      aria-label="Live client projects"
    >
      <div className="content-wrap flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" aria-hidden />
          Live projects we shipped
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {LIVE_PROJECT_URLS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-mono text-[10px] text-accent-bright hover:text-text"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function IcpSection(): React.JSX.Element {
  return (
    <section id="who" className="bf-below-fold border-b border-b1 bg-s1 py-[var(--spacing-section)]" aria-labelledby="who-title">
      <div className="content-wrap">
        <SectionEyebrow>Who It&apos;s For</SectionEyebrow>
        <SectionTitle id="who-title">
          Built for <em className="text-accent-bright not-italic">digital founders</em> — not generic agencies.
        </SectionTitle>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-text-secondary">
          BrandForge is the package tier: fixed scope, fast delivery, one team. Need a fully bespoke build with
          dedicated senior capacity? That&apos;s{" "}
          <a href={SITE.premium} className="text-accent-bright hover:text-text" rel="noopener noreferrer">
            mxstermind.com
          </a>{" "}
          — premium studio, no templates.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {ICP_CARDS.map((card) => (
            <article key={card.title} className="rounded-md border border-b1 bg-s2 p-6">
              <h3 className="text-base font-bold">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection(): React.JSX.Element {
  return (
    <section id="process" className="bf-below-fold border-b border-b1 bg-s1 py-[var(--spacing-section)]" aria-labelledby="process-title">
      <div className="content-wrap">
        <SectionEyebrow>Process</SectionEyebrow>
        <SectionTitle id="process-title">
          Simple. Fast. <em className="text-accent-bright not-italic">No chasing.</em>
        </SectionTitle>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5" aria-label="BrandForge delivery process">
          {PROCESS_STEPS.map((step) => (
            <li key={step.step} className="border-t border-b1 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">{step.step}</p>
              <h3 className="mt-2 text-sm font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 rounded-md border border-b1 bg-s2 p-6">
          <h3 className="text-base font-bold">What to send when you DM (gets you a faster quote)</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {INTAKE_CHECKLIST.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-accent-bright">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function DeliverySection(): React.JSX.Element {
  return (
    <section id="delivery" className="bf-below-fold py-[var(--spacing-section)]" aria-labelledby="delivery-title">
      <div className="content-wrap">
        <SectionEyebrow>Delivery Matrix</SectionEyebrow>
        <SectionTitle id="delivery-title">
          What you <em className="text-accent-bright not-italic">actually get.</em>
        </SectionTitle>
        <p className="mt-5 max-w-2xl text-sm text-text-secondary">
          Every package ends with usable files and clear handoff — not just mockups in a Figma link.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-b2">
                <th scope="col" className="sticky left-0 bg-bg py-3 pr-4 font-mono text-[10px] uppercase tracking-wider text-muted">
                  Deliverable
                </th>
                {PACKAGE_TIER_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="min-w-[140px] py-3 px-3 font-mono text-[10px] uppercase tracking-wider text-muted"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DELIVERY_ROWS.map((row) => (
                <tr key={row.deliverable} className="border-b border-b1">
                  <th scope="row" className="sticky left-0 bg-bg py-3 pr-4 font-semibold text-text">
                    {row.deliverable}
                  </th>
                  <td className="py-3 px-3 text-xs text-text-secondary">{row.blueprint}</td>
                  <td className="py-3 px-3 text-xs text-text-secondary">{row.automator}</td>
                  <td className="py-3 px-3 text-xs text-text-secondary">{row.mvpEngine}</td>
                  <td className="py-3 px-3 text-xs text-text-secondary">{row.aiCommunity}</td>
                  <td className="py-3 px-3 text-xs text-text-secondary">{row.fullStack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function SupportSection(): React.JSX.Element {
  return (
    <section id="support" className="bf-below-fold border-b border-b1 bg-s1 py-[var(--spacing-section)]" aria-labelledby="support-title">
      <div className="content-wrap">
        <SectionEyebrow>Support</SectionEyebrow>
        <SectionTitle id="support-title">
          After delivery, <em className="text-accent-bright not-italic">we stay reachable.</em>
        </SectionTitle>
        <p className="mt-5 max-w-2xl text-sm text-text-secondary">
          We reply on Discord and Telegram during US/EU business hours — typically within a few hours on weekdays.
          Urgent launch issues get priority.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {SUPPORT_CARDS.map((card) => (
            <article key={card.title} className="rounded-md border border-b1 bg-s2 p-6">
              <h3 className="text-base font-bold">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GuaranteeBarSection(): React.JSX.Element {
  return (
    <div className="border-y border-b1 bg-s2" role="region" aria-label="Trust guarantees">
      <div className="content-wrap flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-5">
        {GUARANTEE_ITEMS.map((item) => (
          <span key={item} className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {item.includes("Terms") ? (
              <>
                Money-back guarantee ·{" "}
                <Link href="/terms/" className="text-accent-bright hover:text-text">
                  Terms
                </Link>
              </>
            ) : (
              item
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Below-fold static sections for the home page. */
export function HomeBelowFoldSections(): React.JSX.Element {
  return (
    <>
      <ProcessSection />
      <DeliverySection />
      <SupportSection />
      <GuaranteeBarSection />
    </>
  );
}

export function MxstermindPromoSection(): React.JSX.Element {
  return (
    <aside className="border-b border-b1 bg-s1 py-10">
      <div className="content-wrap flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          Running a serious operation that needs a fully custom engagement?{" "}
          <strong className="font-semibold text-text">
            Our premium studio takes on selective clients — no packages, no templates.
          </strong>
        </p>
        <a
          href={SITE.premium}
          className="shrink-0 rounded border border-b2 px-5 py-2.5 font-mono text-[11px] font-semibold text-accent-bright hover:border-accent hover:text-text"
          rel="noopener noreferrer"
        >
          mxstermind.com →
        </a>
      </div>
    </aside>
  );
}
