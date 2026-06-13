import Image from "next/image";
import { OptimizedPicture } from "@/components/visual/OptimizedPicture";
import { toPictureSources } from "@/lib/portfolio/picture-sources";

type BrowserMockupProps = {
  projectName: string;
  screenshotUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
  imageLoading?: "lazy" | "eager";
  imagePriority?: boolean;
};

export function BrowserMockup({
  projectName,
  screenshotUrl,
  gradientFrom,
  gradientTo,
  className = "",
  imageLoading = "lazy",
  imagePriority = false,
}: BrowserMockupProps): React.JSX.Element {
  const picture = toPictureSources(screenshotUrl);
  const useNativePicture = picture?.avif && picture.webp;

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
        {useNativePicture && picture ? (
          <OptimizedPicture
            avifSrc={picture.avif}
            webpSrc={picture.webp}
            fallbackSrc={picture.fallback}
            alt={`${projectName} screenshot`}
            className="absolute inset-0 h-full w-full object-cover object-top"
            loading={imageLoading}
            fetchPriority={imagePriority ? "high" : "auto"}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : screenshotUrl ? (
          <Image
            src={screenshotUrl}
            alt={`${projectName} screenshot`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 400px"
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
