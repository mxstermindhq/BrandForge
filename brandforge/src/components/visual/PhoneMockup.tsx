import Image from "next/image";

type PhoneMockupProps = {
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
  imageLoading?: "lazy" | "eager";
  imagePriority?: boolean;
};

export function PhoneMockup({
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
  imageLoading = "lazy",
  imagePriority = false,
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
            loading={imageLoading}
            priority={imagePriority}
            decoding="async"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(160deg, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            <span className="text-xs font-bold text-white/80 drop-shadow-sm px-3 text-center leading-relaxed">
              {projectName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
