import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { StickyConversationCTA } from "@/components/directory/StickyConversationCTA";
import { getOperatorMedia, getOperatorWorkPiece } from "@/content/operator-media";
import { getLandingOperators } from "@/lib/operators.server";
import { creativeWorkJsonLd } from "@/lib/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pieceId: string }>;
}): Promise<Metadata> {
  const { slug, pieceId } = await params;
  const handle = decodeURIComponent(slug).replace(/^@+/, "").toLowerCase();
  const rows = await getLandingOperators();
  const operator = rows.find((o) => o.username.toLowerCase() === handle);
  if (!operator) return { title: "Case study not found" };
  const piece = getOperatorWorkPiece(operator.username, decodeURIComponent(pieceId));
  if (!piece) return { title: "Case study not found" };
  return {
    title: `${piece.title} — ${operator.name}`,
    description: piece.description,
    alternates: {
      canonical: `https://brandforge.gg/work/${encodeURIComponent(operator.username)}/${encodeURIComponent(piece.id)}`,
    },
  };
}

export default async function WorkPieceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; pieceId: string }>;
}) {
  const { slug, pieceId } = await params;
  const handle = decodeURIComponent(slug).replace(/^@+/, "").toLowerCase();
  const rows = await getLandingOperators();
  const operator = rows.find((o) => o.username.toLowerCase() === handle);
  if (!operator) notFound();

  const piece = getOperatorWorkPiece(operator.username, decodeURIComponent(pieceId));
  if (!piece) notFound();

  const media = getOperatorMedia(operator.username);
  const otherPieces = (media?.workPieces || []).filter((p) => p.id !== piece.id).slice(0, 3);
  const study = piece.caseStudy;
  const tgSubject = `Work inquiry: ${piece.title} (${operator.name})`;
  const jsonLd = creativeWorkJsonLd(piece.title, piece.description, piece.image, operator, piece.id);

  return (
    <main className="forge-page pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="forge-container forge-page-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/work/${encodeURIComponent(operator.username)}`} className="forge-back-link">
            ← {operator.name}&apos;s portfolio
          </Link>
          <Link href={`/${encodeURIComponent(operator.username)}`} className="forge-back-link">
            Profile →
          </Link>
        </div>

        <article className="forge-detail-article mt-6">
          <div className="relative h-72 w-full overflow-hidden md:h-[440px]">
            <Image src={piece.image} alt={piece.title} fill sizes="(max-width: 768px) 100vw, 1100px" className="object-cover" priority />
            <span className="absolute left-4 top-4 forge-tag backdrop-blur">{piece.stage}</span>
          </div>

          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-[var(--forge-text-muted)]">
                Work by{" "}
                <Link href={`/${encodeURIComponent(operator.username)}`} className="text-[var(--forge-gold)] hover:underline">
                  {operator.name}
                </Link>
              </p>
              <h1 className="mt-1 font-headline text-4xl font-semibold leading-tight text-[var(--forge-text)]">{piece.title}</h1>
              <p className="mt-3 text-base text-[var(--forge-text-muted)]">{piece.description}</p>

              {study?.summary ? (
                <section className="mt-8">
                  <h2 className="forge-section-eyebrow">Overview</h2>
                  <p className="mt-2 text-base leading-relaxed text-[var(--forge-text)]">{study.summary}</p>
                </section>
              ) : null}
              {study?.targetClient ? (
                <section className="mt-6">
                  <h2 className="forge-section-eyebrow">Target client</h2>
                  <p className="mt-2 text-sm text-[var(--forge-text-muted)]">{study.targetClient}</p>
                </section>
              ) : null}
              {study?.coreUseCase ? (
                <section className="mt-6">
                  <h2 className="forge-section-eyebrow">Core use case</h2>
                  <p className="mt-2 text-sm text-[var(--forge-text-muted)]">{study.coreUseCase}</p>
                </section>
              ) : null}
              {study?.mainFunctions?.length ? (
                <section className="mt-6">
                  <h2 className="forge-section-eyebrow">Main functions</h2>
                  <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    {study.mainFunctions.map((fn) => (
                      <li key={fn} className="forge-surface-card py-2 text-[var(--forge-text-muted)]">
                        <span className="mr-2 text-[var(--forge-fire)]">✓</span>
                        {fn}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {study?.outcome ? (
                <section className="forge-detail-panel forge-detail-panel-accent mt-6">
                  <h2 className="forge-section-eyebrow">Outcome</h2>
                  <p className="mt-1 text-sm text-[var(--forge-text)]">{study.outcome}</p>
                </section>
              ) : null}
            </div>

            <aside className="offer-sticky-panel space-y-4">
              <div className="forge-detail-panel forge-detail-panel-accent">
                <p className="forge-section-eyebrow">Interested?</p>
                <p className="mt-2 text-sm text-[var(--forge-text-muted)]">Message on Telegram or Discord — fast scope, fast start.</p>
                <a
                  href={contactMessage(tgSubject)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="forge-btn forge-btn-primary mt-4 flex min-h-11 w-full items-center justify-center text-sm"
                  data-track="work_piece_cta"
                >
                  Get this built →
                </a>
              </div>
              {study?.stack?.length ? (
                <div className="forge-detail-panel">
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--forge-text-muted)]">Stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {study.stack.map((item) => (
                      <span key={item} className="forge-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </article>

        {otherPieces.length ? (
          <section className="mt-12">
            <h2 className="forge-section-title text-2xl">More from {operator.name}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {otherPieces.map((other) => (
                <Link
                  key={other.id}
                  href={`/work/${encodeURIComponent(operator.username)}/${encodeURIComponent(other.id)}`}
                  className="forge-listing-card overflow-hidden"
                >
                  <div className="relative h-44 w-full">
                    <Image src={other.image} alt={other.title} fill sizes="360px" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[var(--forge-gold)]">{other.stage}</p>
                    <p className="text-sm font-semibold">{other.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <StickyConversationCTA subject={tgSubject} label="Discuss this case study" sublabel={operator.name} />
    </main>
  );
}
