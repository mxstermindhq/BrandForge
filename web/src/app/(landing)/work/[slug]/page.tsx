import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { StickyConversationCTA } from "@/components/directory/StickyConversationCTA";
import { getOperatorMedia } from "@/content/operator-media";
import { getLandingOperators } from "@/lib/operators.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const handle = decodeURIComponent(slug).replace(/^@+/, "").toLowerCase();
  const rows = await getLandingOperators();
  const operator = rows.find((o) => o.username.toLowerCase() === handle);
  if (!operator) return { title: "Portfolio not found" };
  return {
    title: `${operator.name} — Portfolio`,
    description: operator.bestResult,
    alternates: { canonical: `https://brandforge.gg/work/${encodeURIComponent(operator.username)}` },
  };
}

export default async function WorkPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const handle = decodeURIComponent(slug).replace(/^@+/, "").toLowerCase();
  const rows = await getLandingOperators();
  const operator = rows.find((o) => o.username.toLowerCase() === handle);
  if (!operator) notFound();

  const media = getOperatorMedia(operator.username);
  const pieces = media?.workPieces ?? [];
  const tgSubject = `Portfolio inquiry: ${operator.name} (@${operator.username})`;

  return (
    <main className="forge-page pb-28">
      <div className="forge-container forge-page-inner">
        <Link href="/#browse" className="forge-back-link">
          ← Marketplace
        </Link>

        <header className="forge-detail-article mt-6">
          {media?.cover ? (
            <div className="relative h-56 w-full overflow-hidden md:h-72">
              <Image
                src={media.cover}
                alt={`${operator.name} portfolio`}
                fill
                sizes="(max-width: 768px) 100vw, 1100px"
                className="object-cover"
                priority
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(3,3,5,0) 40%, rgba(10,8,8,0.95) 100%)",
                }}
              />
            </div>
          ) : null}
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="forge-section-eyebrow">Portfolio</p>
              <h1 className="forge-section-title">{operator.name}</h1>
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">{operator.role}</p>
              <p className="mt-3 text-base text-[var(--forge-text)]">{operator.bestResult}</p>
            </div>
            <div className="forge-detail-panel forge-detail-panel-accent">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forge-gold)]">From</p>
              <p className="mt-1 font-headline text-2xl font-semibold">{operator.startingPrice}</p>
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">{operator.pricingModel}</p>
              <a
                href={contactMessage(tgSubject)}
                target="_blank"
                rel="noopener noreferrer"
                className="forge-btn forge-btn-primary mt-4 flex min-h-11 w-full items-center justify-center text-sm"
                data-track="work_portfolio_cta"
              >
                Discuss this portfolio →
              </a>
            </div>
          </div>
        </header>

        {pieces.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {pieces.map((piece) => (
              <Link
                key={piece.id}
                href={`/work/${encodeURIComponent(operator.username)}/${encodeURIComponent(piece.id)}`}
                className="forge-listing-card group block overflow-hidden transition-all hover:-translate-y-1"
                data-track={`work_piece_${piece.id}`}
              >
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={piece.image}
                    alt={piece.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 forge-tag backdrop-blur">{piece.stage}</span>
                </div>
                <div className="p-5">
                  <h2 className="font-headline text-xl font-semibold text-[var(--forge-text)]">{piece.title}</h2>
                  <p className="mt-1 text-sm text-[var(--forge-text-muted)]">{piece.description}</p>
                  <p className="mt-3 text-xs font-semibold text-[var(--forge-gold)]">Open case study →</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="forge-surface-card mt-8 text-center text-sm">Portfolio coming soon.</div>
        )}
      </div>

      <StickyConversationCTA subject={tgSubject} label="Discuss this work" sublabel={operator.name} />
    </main>
  );
}
