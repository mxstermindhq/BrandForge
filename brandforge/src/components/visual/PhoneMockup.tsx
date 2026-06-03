import Image from "next/image";

type PhoneMockupProps = {
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
};

export function PhoneMockup({
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
}: PhoneMockupProps): React.JSX.Element {
  return (
    <div
      className={`mx-auto w-[min(100%,220px)] rounded-[2rem] border-[3px] border-b2 bg-bg p-2 shadow-xl ${className}`}
      aria-label={`${projectName} mobile preview`}
    >
      <div className="mb-1 flex justify-center" aria-hidden>
        <span className="h-1 w-10 rounded-full bg-b2" />
      </div>
      <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.4rem] bg-s1">
        {screenshotUrl ? (
          <Image
            src={screenshotUrl}
            alt={`${projectName} app screenshot`}
            fill
            className="object-cover object-top"
            sizes="220px"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${gradientFrom}, ${gradientTo})`,
            }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
