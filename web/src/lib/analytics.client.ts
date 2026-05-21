"use client";

type TrackProps = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(event: string, props?: TrackProps) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname + window.location.search;
  const payload = {
    event,
    path,
    props: props ?? {},
  };
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through */
  }
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView() {
  trackEvent("page_view");
}

export function trackCtaClick(label: string, href?: string) {
  trackEvent("cta_click", { label, href: href ?? "" });
}
