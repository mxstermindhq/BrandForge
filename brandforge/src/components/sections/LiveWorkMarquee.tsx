import { projectsByStatus } from "@/content/portfolio/projects";

function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return "/img/logo-mark-512.png";
  }
}

function MarqueeLink({
  name,
  url,
}: {
  name: string;
  url: string;
}): React.JSX.Element {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] text-accent-bright hover:text-text"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={faviconFor(url)}
        alt=""
        width={16}
        height={16}
        className="rounded-sm"
        loading="lazy"
        decoding="async"
      />
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-[var(--green)]" aria-hidden />
        {name}
      </span>
    </a>
  );
}

/** Scrolling live-project strip — static wrap when prefers-reduced-motion. */
export function LiveWorkMarquee(): React.JSX.Element {
  const live = projectsByStatus("live").filter((p) => p.url);
  const items = [...live, ...live];

  return (
    <aside className="border-y border-b1 bg-s1 py-4" aria-label="Live client projects">
      <div className="content-wrap mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] bf-live-pulse" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Live projects we shipped
        </span>
      </div>

      {/* Animated marquee — hidden when user prefers reduced motion */}
      <div className="bf-marquee-track overflow-hidden">
        <div className="bf-marquee flex w-max gap-8 px-4">
          {items.map((item, i) => (
            <MarqueeLink key={`${item.slug}-${i}`} name={item.name} url={item.url!} />
          ))}
        </div>
      </div>

      {/* Static grid for reduced motion */}
      <div className="bf-marquee-static content-wrap flex-wrap gap-x-6 gap-y-2">
        {live.map((item) => (
          <MarqueeLink key={item.slug} name={item.name} url={item.url!} />
        ))}
      </div>
    </aside>
  );
}
