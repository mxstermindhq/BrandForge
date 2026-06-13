const STEPS = [
  { day: "Day 0", label: "Message Discord/Telegram with scope" },
  { day: "≤24h", label: "Fixed USD quote + capacity check" },
  { day: "Day 1–3", label: "Escrow / payment confirmed" },
  { day: "Day 3–5", label: "Kickoff + asset intake" },
  { day: "Sprint", label: "Delivery per tier capacity limits" },
] as const;

/** Visual delivery timeline for /packages/ — static, no JS. */
export function DeliveryTimeline(): React.JSX.Element {
  return (
    <section className="py-12" aria-labelledby="delivery-timeline-title">
      <div className="content-wrap">
        <h2 id="delivery-timeline-title" className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
          Typical delivery timeline
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-5">
          {STEPS.map((step, i) => (
            <li
              key={step.day}
              className="relative rounded-md border border-b1 bg-s1 p-4"
            >
              {i < STEPS.length - 1 ? (
                <span
                  className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-4 translate-x-full bg-b2 md:block"
                  aria-hidden
                />
              ) : null}
              <p className="font-mono text-xs font-bold text-accent-bright">{step.day}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{step.label}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
