import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { getLandingOperators } from "@/lib/operators.server";

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const handle = decodeURIComponent(slug).replace(/^@+/, "").toLowerCase();
  const rows = await getLandingOperators();
  const operator = rows.find((o) => o.username.toLowerCase() === handle);
  if (!operator) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:underline">
        ← Back
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.1em] text-[var(--color-gold)]">Work</p>
      <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">{operator.name}</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">{operator.bestResult}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Done", "Doing", "Planned"].map((stage) => (
          <article key={stage} className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div
              className="h-40"
              style={{
                background:
                  "linear-gradient(145deg, color-mix(in srgb, var(--color-gold) 14%, white), color-mix(in srgb, var(--color-gold) 4%, white))",
              }}
            />
            <div className="p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{stage}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{operator.role}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8">
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
    </main>
  );
}
