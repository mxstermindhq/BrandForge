import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { OPERATOR_MEDIA, type OperatorService } from "@/content/operator-media";
import { OPERATOR_SEED } from "@/content/operator-seed";

type FoundService = {
  service: OperatorService;
  operatorUsername: string;
  operatorName: string;
};

function findService(id: string): FoundService | null {
  for (const operator of OPERATOR_SEED) {
    const media = OPERATOR_MEDIA[operator.username.toLowerCase()];
    if (!media) continue;
    const match = media.services.find((s) => s.id === id);
    if (match) {
      return { service: match, operatorUsername: operator.username, operatorName: operator.name };
    }
  }
  return null;
}

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = findService(id);
  if (!found) notFound();
  const { service, operatorUsername, operatorName } = found;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:underline">
        ← Back to directory
      </Link>

      <article
        className="mt-6 overflow-hidden rounded-3xl border bg-[var(--color-surface)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover"
            priority
          />
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] backdrop-blur"
            style={{ background: "color-mix(in srgb, white 82%, transparent)", color: "var(--color-gold)" }}
          >
            Service
          </span>
        </div>

        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              by{" "}
              <Link href={`/${encodeURIComponent(operatorUsername)}`} className="text-[var(--color-gold)] hover:underline">
                {operatorName}
              </Link>
            </p>
            <h1 className="mt-1 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">
              {service.name}
            </h1>
            <p className="mt-3 text-base text-[var(--color-text-secondary)]">{service.tagline}</p>

            <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              {service.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded-lg border px-3 py-2 text-[var(--color-text-secondary)]"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                >
                  <span className="mr-2 text-[var(--color-gold)]">✓</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <aside
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)" }}
          >
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">Starting from</p>
            <p className="mt-1 font-headline text-3xl font-semibold text-[var(--color-text-primary)]">
              {service.price}
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Routed by mxstermind. Scope confirmed before payment.
            </p>
            <a
              href={contactMessage(`Interest in service: ${service.name} (${operatorName})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-white"
              style={{ background: "var(--color-gold)" }}
            >
              Show interest via Telegram →
            </a>
            <Link
              href={`/${encodeURIComponent(operatorUsername)}`}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-4 text-sm font-medium text-[var(--color-text-primary)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              View {operatorName}&apos;s profile
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
