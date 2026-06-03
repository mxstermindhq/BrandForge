import Image from "next/image";

type TabletMockupProps = {
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
};

export function TabletMockup({
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
}: TabletMockupProps): React.JSX.Element {
  return (
    <div
      className={`mx-auto w-full max-w-sm rounded-xl border-[3px] border-b2 bg-bg p-2 shadow-lg ${className}`}
      aria-label={`${projectName} tablet preview`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-s1">
        {screenshotUrl ? (
          <Image
            src={screenshotUrl}
            alt={`${projectName} tablet screenshot`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 384px"
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
