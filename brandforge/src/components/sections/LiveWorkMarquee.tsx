import { projectsByStatus } from "@/content/portfolio/projects";

function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return "/img/logo-mark-512.png";
  }
}

/** Scrolling live-project strip with favicon thumbnails. */
export function LiveWorkMarquee(): React.JSX.Element {
  const live = projectsByStatus("live").filter((p) => p.url);
  const items = [...live, ...live];

  return (
    <aside className="border-y border-b1 bg-s1 py-4 overflow-hidden" aria-label="Live client projects">
      <div className="content-wrap mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Live projects we shipped</span>
      </div>
      <div className="bf-marquee flex w-max gap-8 px-4">
        {items.map((item, i) => (
          <a
            key={`${item.slug}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] text-accent-bright hover:text-text"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconFor(item.url!)}
              alt=""
              width={16}
              height={16}
              className="rounded-sm"
              loading="lazy"
            />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[var(--green)]" aria-hidden />
              {item.name}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
