type OptimizedPictureProps = {
  avifSrc?: string;
  webpSrc?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  width?: number;
  height?: number;
};

/** AVIF → WebP → fallback with native lazy loading. */
export function OptimizedPicture({
  avifSrc,
  webpSrc,
  fallbackSrc,
  alt,
  className = "",
  loading = "lazy",
  fetchPriority,
  sizes = "100vw",
  width,
  height,
}: OptimizedPictureProps): React.JSX.Element {
  const imgProps = {
    alt,
    loading,
    decoding: "async" as const,
    className,
    width,
    height,
    ...(fetchPriority ? { fetchPriority } : {}),
  };

  if (!avifSrc && !webpSrc) {
    return <img src={fallbackSrc} {...imgProps} />;
  }

  return (
    <picture>
      {avifSrc ? <source srcSet={avifSrc} type="image/avif" sizes={sizes} /> : null}
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" sizes={sizes} /> : null}
      <img src={fallbackSrc} {...imgProps} />
    </picture>
  );
}
