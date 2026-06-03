import Image from "next/image";

type BrowserMockupProps = {
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
};

export function BrowserMockup({
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
}: BrowserMockupProps): React.JSX.Element {
  return (
    <div
      className={`overflow-hidden rounded-md border border-b1 bg-s2 shadow-lg ${className}`}
      aria-label={`${projectName} desktop preview`}
    >
      <div className="flex items-center gap-1.5 border-b border-b1 bg-bg px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-500/80" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-amber/80" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[var(--green)]/80" aria-hidden />
        <span className="ml-2 flex-1 truncate font-mono text-[8px] text-muted">{projectName}</span>
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg">
        {screenshotUrl ? (
          <Image
            src={screenshotUrl}
            alt={`${projectName} screenshot`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 400px"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
