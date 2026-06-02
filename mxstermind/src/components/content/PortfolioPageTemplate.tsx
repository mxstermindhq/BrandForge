import Link from "next/link";
import { CTASection, FAQBlock } from "@/components/content";
import type { PortfolioDetail } from "@/types/portfolio-page";

type PortfolioPageTemplateProps = {
  project: PortfolioDetail;
};

function VisualFrame({ label, caption }: { label: string; caption: string }): React.JSX.Element {
  return (
    <figure className="overflow-hidden rounded-md border border-b1 bg-s2">
      <div
        className="flex aspect-video items-center justify-center border-b border-b1 bg-gradient-to-br from-s1 via-bg to-s2"
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      </div>
      <figcaption className="p-3 font-mono text-[9px] text-muted">{caption}</figcaption>
    </figure>
  );
}

/** Full portfolio case study layout. */
export function PortfolioPageTemplate({ project }: PortfolioPageTemplateProps): React.JSX.Element {
  return (
    <>
      <header className="border-b border-b1 pb-12 pt-4">
        <div className="content-wrap">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">{project.tag}</p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-bold">{project.name}</h1>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-4 inline-block font-mono text-[11px] text-accent-bright hover:text-text"
            >
              {project.liveLabel ?? "View live project"} ↗
            </a>
          ) : null}
        </div>
      </header>

      <section className="py-12">
        <div className="content-wrap grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-bold">Context</h2>
              <div className="mt-4 space-y-3">
                {project.context.map((p) => (
                  <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">The problem</h2>
              <ul className="mt-4 space-y-2">
                {project.problem.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent-bright">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="rounded-md border border-b1 bg-s1 p-6 h-fit">
            <dl className="space-y-4 font-mono text-[10px]">
              <div>
                <dt className="uppercase tracking-wider text-muted">Timeline</dt>
                <dd className="mt-1 text-sm text-text">{project.timeline}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-muted">Team</dt>
                <dd className="mt-1 text-sm text-text">{project.teamSize}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-muted">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.stack.map((tag) => (
                    <span key={tag} className="rounded-sm border border-b2 px-1.5 py-0.5 text-[9px] text-muted">
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="border-y border-b1 bg-s1 py-12">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">What we delivered</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {project.delivered.map((item) => (
              <li key={item} className="text-sm text-text-secondary">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">Outcome</h2>
          <div className="mt-4 space-y-3">
            {project.outcome.map((p) => (
              <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-b1 py-12">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Visuals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.visuals.map((v) => (
              <VisualFrame key={v.label} label={v.label} caption={v.caption} />
            ))}
          </div>
        </div>
      </section>

      {project.vouch ? (
        <section className="py-12">
          <div className="content-wrap">
            <blockquote className="rounded-md border border-b1 bg-s2 p-8">
              <p className="text-base leading-relaxed text-text-secondary">
                &ldquo;{project.vouch.quote}&rdquo;
              </p>
              <footer className="mt-4 font-mono text-[10px] text-accent-bright">
                {project.vouch.who} · {project.vouch.from}
              </footer>
            </blockquote>
          </div>
        </section>
      ) : null}

      <section className="border-t border-b1 py-10">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Related services</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {project.relatedServices.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="font-mono text-[11px] text-accent-bright hover:text-text"
                data-cursor="hover"
              >
                {s.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FAQBlock items={project.faqs} title="Questions about this type of project" />
      <CTASection
        title="Want similar work?"
        subhead="Send references on Discord or Telegram — fixed quote in 24 hours."
      />
    </>
  );
}
