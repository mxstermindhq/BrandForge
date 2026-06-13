import Image from "next/image";

type TabletMockupProps = {
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
  imageLoading?: "lazy" | "eager";
  imagePriority?: boolean;
};

export function TabletMockup({
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
  imageLoading = "lazy",
  imagePriority = false,
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
            loading={imageLoading}
            priority={imagePriority}
            decoding="async"
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
