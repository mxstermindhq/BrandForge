import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { getLandingOperators } from "@/lib/operators.server";
import { getOperatorMedia, getOperatorWorkPiece } from "@/content/operator-media";

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-text-secondary)]">
        <Link href={`/work/${encodeURIComponent(operator.username)}`} className="hover:underline">
          ← {operator.name}&apos;s portfolio
        </Link>
        <Link href={`/${encodeURIComponent(operator.username)}`} className="hover:underline">
          Open {operator.name}&apos;s profile →
        </Link>
      </div>

      <article
        className="mt-6 overflow-hidden rounded-3xl border bg-[var(--color-surface)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="relative h-72 w-full overflow-hidden md:h-[440px]">
          <Image
            src={piece.image}
            alt={piece.title}
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover"
            priority
          />
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] backdrop-blur"
            style={{ background: "color-mix(in srgb, white 82%, transparent)", color: "var(--color-gold)" }}
          >
            {piece.stage}
          </span>
        </div>

        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Work by{" "}
              <Link href={`/${encodeURIComponent(operator.username)}`} className="text-[var(--color-gold)] hover:underline">
                {operator.name}
              </Link>
            </p>
            <h1 className="mt-1 font-headline text-4xl font-semibold leading-tight text-[var(--color-text-primary)]">
              {piece.title}
            </h1>
            <p className="mt-3 text-base text-[var(--color-text-secondary)]">{piece.description}</p>

            {study?.summary ? (
              <section className="mt-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  Overview
                </h2>
                <p className="mt-2 text-base leading-relaxed text-[var(--color-text-primary)]">
                  {study.summary}
                </p>
              </section>
            ) : null}

            {study?.targetClient ? (
              <section className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  Target client
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {study.targetClient}
                </p>
              </section>
            ) : null}

            {study?.coreUseCase ? (
              <section className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  Core use case
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {study.coreUseCase}
                </p>
              </section>
            ) : null}

            {study?.mainFunctions?.length ? (
              <section className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  Main functions
                </h2>
                <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {study.mainFunctions.map((fn) => (
                    <li
                      key={fn}
                      className="rounded-lg border px-3 py-2 text-[var(--color-text-secondary)]"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                    >
                      <span className="mr-2 text-[var(--color-gold)]">✓</span>
                      {fn}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {study?.idealFlow?.length ? (
              <section className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  Ideal flow
                </h2>
                <ul className="mt-2 grid gap-2 text-sm">
                  {study.idealFlow.map((step) => (
                    <li
                      key={step}
                      className="rounded-lg border px-3 py-2 text-[var(--color-text-secondary)]"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      {step}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {study?.outcome ? (
              <section
                className="mt-6 rounded-2xl border-l-2 px-4 py-3"
                style={{ borderLeftColor: "var(--color-gold)", background: "var(--color-gold-subtle)" }}
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  Outcome
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-primary)]">{study.outcome}</p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)" }}
            >
              <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-gold)]">Interested?</p>
              <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                Routed by mxstermind. One conversation. Right next step.
              </p>
              <a
                href={contactMessage(`Interest in work: ${piece.title} (${operator.name})`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-white"
                style={{ background: "var(--color-gold)" }}
              >
                Show interest via Telegram →
              </a>
              <Link
                href={`/${encodeURIComponent(operator.username)}`}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-4 text-sm font-medium text-[var(--color-text-primary)]"
                style={{ borderColor: "var(--color-border)" }}
              >
                View {operator.name}&apos;s profile
              </Link>
            </div>

            {study?.stack?.length ? (
              <div
                className="rounded-2xl border p-5"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
              >
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Stack</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {study.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border px-2.5 py-0.5 text-[11px] text-[var(--color-text-secondary)]"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
            >
              <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Stage</p>
              <p className="mt-1 text-base font-semibold capitalize text-[var(--color-text-primary)]">
                {piece.stage}
              </p>
            </div>
          </aside>
        </div>
      </article>

      {otherPieces.length ? (
        <section className="mt-12">
          <h2 className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">
            More from {operator.name}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {otherPieces.map((other) => (
              <Link
                key={other.id}
                href={`/work/${encodeURIComponent(operator.username)}/${encodeURIComponent(other.id)}`}
                className="group block overflow-hidden rounded-2xl border bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)]"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={other.image}
                    alt={other.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{other.stage}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{other.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
