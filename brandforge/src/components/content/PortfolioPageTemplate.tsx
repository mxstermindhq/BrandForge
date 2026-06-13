import Link from "next/link";
import { CTASection, FAQBlock, InlineCTA } from "@/components/content";
import { CopyIntakeButton } from "@/components/marketing/CopyIntakeButton";
import { ResultStatBox } from "@/components/marketing/ResultStatBox";
import { ProjectMockup, ProjectStatusBadge, TechChip, VisualStatCard } from "@/components/visual";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import {
  resolveProjectGallery,
  resolveProjectScreenshot,
} from "@/lib/portfolio/screenshot-url";
import { getRelatedProjects, nicheLinksForProject } from "@/lib/portfolio/related";
import { ctaTrackAttrs, discordHref, portfolioExternalHref } from "@/lib/tracking";
import type { PortfolioDetail } from "@/types/portfolio";

type PortfolioPageTemplateProps = {
  project: PortfolioDetail;
};

export function PortfolioPageTemplate({ project }: PortfolioPageTemplateProps): React.JSX.Element {
  const sourceProject = PORTFOLIO_PROJECTS.find((p) => p.slug === project.slug);
  const related = sourceProject ? getRelatedProjects(sourceProject, 3) : [];
  const nicheLinks = sourceProject ? nicheLinksForProject(sourceProject) : [];
  const intakeMsg = `Hi BrandForge — I want something like ${project.name}.\n\nNiche: \nReferences: \nDeadline: `;
  const campaign = `portfolio-similar-${project.slug}`;
  const screenshotUrl = resolveProjectScreenshot({
    slug: project.slug,
    ogImageUrl: project.ogImageUrl,
  });
  const galleryUrls = resolveProjectGallery(project.slug);
  const screenshotShots =
    galleryUrls.length > 0
      ? galleryUrls.map((url, index) => ({
          url,
          label: project.visuals[index]?.label ?? `Screen ${index + 1}`,
          caption:
            project.visuals[index]?.caption ??
            `${project.name} product surface ${index + 1}`,
          mockupType: project.visuals[index]?.mockupType ?? project.mockupType,
        }))
      : project.visuals.map((v) => ({
          url: screenshotUrl,
          label: v.label,
          caption: v.caption,
          mockupType: v.mockupType ?? project.mockupType,
        }));

  return (
    <>
      <header className="border-b border-b1 pb-12 pt-4">
        <div className="content-wrap grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
                {project.tag}
              </p>
              <ProjectStatusBadge status={project.status} />
            </div>
            <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-bold">{project.name}</h1>
            {project.liveUrl ? (
              <a
                href={portfolioExternalHref(project.liveUrl, project.slug)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-block font-mono text-[11px] text-accent-bright hover:text-text"
              >
                {project.liveLabel ?? "View live project"} ↗
              </a>
            ) : null}
            {project.confidentialNote ? (
              <p className="mt-4 font-mono text-[10px] text-muted">{project.confidentialNote}</p>
            ) : null}
          </div>
          <ProjectMockup
            type={project.mockupType}
            projectName={project.name}
            screenshotUrl={screenshotUrl}
            gradientFrom={project.brandGradient[0]}
            gradientTo={project.brandGradient[1]}
            overlay={<ProjectStatusBadge status={project.status} />}
          />
        </div>
      </header>

      <section className="border-b border-b1 bg-s1 py-10">
        <div className="content-wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VisualStatCard value={project.timeline} label="Timeline" />
          <VisualStatCard value={project.teamSize} label="Team" />
          <VisualStatCard
            value={project.budgetPublic ?? "Scoped"}
            label="Budget"
            sublabel={project.budgetPublic ? "Public scope" : "Quoted on intake"}
          />
          <VisualStatCard value={project.outcomeMetric} label="Outcome" />
        </div>
      </section>

      <section className="py-12">
        <div className="content-wrap grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="text-lg font-bold">The brief</h2>
              <div className="mt-4 space-y-3">
                {project.context.map((p) => (
                  <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">What we built</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {project.delivered.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-b1 bg-s2 p-4 text-sm text-text-secondary"
                  >
                    <span className="text-accent-bright" aria-hidden>
                      →{" "}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="h-fit rounded-md border border-b1 bg-s1 p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Tech stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tag) => (
                <TechChip key={tag} label={tag} />
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-b1 bg-s1 py-12">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">Screenshots &amp; product surfaces</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {screenshotShots.map((shot) => (
              <figure key={`${shot.label}-${shot.url}`}>
                <ProjectMockup
                  type={shot.mockupType}
                  projectName={`${project.name} — ${shot.label}`}
                  screenshotUrl={shot.url}
                  gradientFrom={project.brandGradient[0]}
                  gradientTo={project.brandGradient[1]}
                />
                <figcaption className="mt-2 font-mono text-[9px] text-muted">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <InlineCTA
        headline="Want results like this?"
        subhead="DM scope on Discord or Telegram — name this project type for a faster quote."
      />

      <section className="py-12">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">Outcome</h2>
          {project.highlights && project.highlights.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.highlights.map((h) => (
                <ResultStatBox key={h.stat} {...h} />
              ))}
            </div>
          ) : null}
          <div className="mt-6 space-y-3">
            {project.outcome.map((p) => (
              <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {project.vouch ? (
        <section className="py-12">
          <div className="content-wrap">
            <blockquote className="relative overflow-hidden rounded-md border border-b1 bg-s2 p-8 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gradient-to-b before:from-amber before:to-transparent">
              <p className="text-base italic leading-relaxed text-text-secondary">
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
              >
                {s.label} →
              </Link>
            ))}
          </div>
          {nicheLinks.length > 0 ? (
            <>
              <h2 className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Perfect for
              </h2>
              <div className="mt-4 flex flex-wrap gap-4">
                {nicheLinks.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="font-mono text-[11px] capitalize text-accent-bright hover:text-text"
                  >
                    {n.label} →
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-b1 bg-s1 py-12">
          <div className="content-wrap">
            <h2 className="text-lg font-bold">Related projects</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/portfolio/${p.slug}/`}
                  className="rounded-md border border-b1 bg-bg p-5 hover:border-accent"
                >
                  <p className="font-mono text-[9px] uppercase text-muted">{p.category}</p>
                  <p className="mt-2 font-bold">{p.name}</p>
                  <p className="mt-2 text-xs text-text-secondary">{p.description.slice(0, 100)}…</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-b1 py-10">
        <div className="content-wrap flex flex-wrap items-center gap-4">
          <a
            href={discordHref(campaign)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-discord px-6 py-3 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", campaign)}
          >
            Start similar project on Discord
          </a>
          <CopyIntakeButton text={intakeMsg} label="Copy intake message" />
        </div>
      </section>

      <FAQBlock items={project.faqs} title="Questions about this type of project" pageSlug={`/portfolio/${project.slug}/`} />
      <CTASection
        title="Want similar work?"
        subhead="Send references on Discord or Telegram — fixed quote in 24 hours."
        discordLabel="Get a quote on Discord"
        telegramLabel="Quote on Telegram"
        campaign={`portfolio-${project.slug}-footer-cta`}
      />
    </>
  );
}
