export const SERVICE_LISTING_CATEGORIES = [
  "Design",
  "Development",
  "AI-Powered",
  "Marketing",
  "Content",
  "Video",
  "Audio",
] as const;

/** Same list as SERVICE_LISTING_CATEGORIES — stable alias for forms and imports. */
export const CATEGORIES = SERVICE_LISTING_CATEGORIES;

export type ServiceListingCategory = (typeof SERVICE_LISTING_CATEGORIES)[number];
