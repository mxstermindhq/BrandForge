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
    <main className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 sm:pb-12">
      <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
        ← Directory
      </Link>

      <header
        className="mt-6 overflow-hidden rounded-3xl border bg-[var(--color-surface)]"
        style={{ borderColor: "var(--color-border)" }}
      >
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
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.92) 100%)",
              }}
            />
          </div>
        ) : null}
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-gold)]">Portfolio</p>
            <h1 className="mt-1 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">
              {operator.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{operator.role}</p>
            <p className="mt-3 text-base text-[var(--color-text-primary)]">{operator.bestResult}</p>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]">From</p>
            <p className="mt-1 font-headline text-2xl font-semibold text-[var(--color-text-primary)]">
              {operator.startingPrice}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{operator.pricingModel}</p>
            <a
              href={contactMessage(tgSubject)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 flex min-h-11 w-full items-center justify-center text-sm"
              data-track="work_portfolio_cta"
            >
              Discuss this portfolio →
            </a>
            <Link
              href={`/${encodeURIComponent(operator.username)}`}
              className="mt-2 flex min-h-10 w-full items-center justify-center rounded-xl border text-sm font-medium"
              style={{ borderColor: "var(--color-border)" }}
            >
              Full profile
            </Link>
          </div>
        </div>
      </header>

      {pieces.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {pieces.map((piece) => (
            <Link
              key={piece.id}
              href={`/work/${encodeURIComponent(operator.username)}/${encodeURIComponent(piece.id)}`}
              className="group block overflow-hidden rounded-3xl border bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)]"
              style={{ borderColor: "var(--color-border)" }}
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
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur"
                  style={{
                    background: "color-mix(in srgb, white 82%, transparent)",
                    color: "var(--color-gold)",
                  }}
                >
                  {piece.stage}
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">
                  {piece.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{piece.description}</p>
                <p className="mt-3 text-xs font-semibold text-[var(--color-gold)]">Open case study →</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="mt-8 rounded-3xl border p-8 text-center text-sm text-[var(--color-text-secondary)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          This operator&apos;s portfolio is being prepared.
        </div>
      )}

      <StickyConversationCTA
        subject={tgSubject}
        label="Discuss this work"
        sublabel={`mxstermind · ${operator.name}`}
      />
    </main>
  );
}
