"use client";

import { useCallback, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { SITE } from "@/config/site";

type VideoThumbnailProps = {
  title: string;
  thumbnailSrc?: string;
  /** YouTube / MP4 URL — omit for thumbnail-only showcase CTA */
  videoUrl?: string;
  campaign?: string;
};

function youtubeEmbedUrl(url: string): string | null {
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  if (url.includes("/embed/")) return url;
  return null;
}

/** Lazy video thumbnail — opens modal with embed or Discord CTA. */
export function VideoThumbnail({
  title,
  thumbnailSrc,
  videoUrl,
  campaign = "portfolio-video",
}: VideoThumbnailProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  const embedUrl = videoUrl ? youtubeEmbedUrl(videoUrl) : null;
  const isMp4 = Boolean(videoUrl?.endsWith(".mp4"));

  const onPlay = useCallback((): void => {
    trackEvent("video_play", { title, campaign, has_embed: embedUrl || isMp4 ? "1" : "0" });
    setOpen(true);
  }, [title, campaign, embedUrl, isMp4]);

  return (
    <>
      <button
        type="button"
        onClick={onPlay}
        className="group relative mt-8 w-full overflow-hidden rounded-md border border-b1 bg-s1 text-left"
        aria-label={`Play ${title} showcase video`}
      >
        <div
          className="aspect-video w-full bg-gradient-to-br from-s2 to-bg"
          style={
            thumbnailSrc
              ? { backgroundImage: `url(${thumbnailSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <span className="absolute inset-0 flex items-center justify-center bg-bg/40 transition group-hover:bg-bg/20">
          <span className="rounded-full border border-accent bg-accent/90 px-4 py-2 font-mono text-[10px] font-bold text-white">
            ▶ Watch showcase
          </span>
        </span>
        <p className="border-t border-b1 px-4 py-2 font-mono text-[10px] text-muted">{title}</p>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-bg/90 p-4"
          role="dialog"
          aria-modal
          aria-label={title}
        >
          <div className="w-full max-w-3xl">
            {embedUrl ? (
              <iframe
                title={title}
                src={embedUrl}
                className="aspect-video w-full rounded-md border border-b1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isMp4 && videoUrl ? (
              <video controls className="w-full rounded-md border border-b1" src={videoUrl} />
            ) : (
              <div className="rounded-md border border-b1 bg-s1 p-8 text-center">
                <p className="text-sm text-text-secondary">
                  Full motion showcase available on request — DM BrandForge on Discord with this project name.
                </p>
                <a
                  href={SITE.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block border border-accent/60 bg-accent/15 px-4 py-2 font-mono text-[10px] font-bold text-accent hover:bg-accent/25"
                >
                  Request showcase on Discord
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 rounded border border-b2 px-4 py-2 font-mono text-[10px] text-muted"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
