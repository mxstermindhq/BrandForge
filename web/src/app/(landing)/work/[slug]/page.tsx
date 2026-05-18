import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { getLandingOperators } from "@/lib/operators.server";
import { getOperatorMedia } from "@/content/operator-media";

export default async function WorkPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const handle = decodeURIComponent(slug).replace(/^@+/, "").toLowerCase();
  const rows = await getLandingOperators();
  const operator = rows.find((o) => o.username.toLowerCase() === handle);
  if (!operator) notFound();

  const media = getOperatorMedia(operator.username);
  const pieces = media?.workPieces ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:underline">
        ← Back to directory
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
                  "linear-gradient(180deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.85) 100%)",
              }}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-gold)]">Portfolio</p>
            <h1 className="mt-1 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">
              {operator.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{operator.bestResult}</p>
          </div>
          <a
            href={contactMessage(`Interest in work portfolio: ${operator.name} (@${operator.username})`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-white"
            style={{ background: "var(--color-gold)" }}
          >
            Show interest via Telegram →
          </a>
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

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${encodeURIComponent(operator.username)}`}
          className="text-sm text-[var(--color-text-secondary)] hover:underline"
        >
          View {operator.name}&apos;s full profile →
        </Link>
        <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:underline">
          ← Back to directory
        </Link>
      </div>
    </main>
  );
}
