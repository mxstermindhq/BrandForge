type PageRouteLoadingProps = {
  title?: string;
  subtitle?: string;
  /** `full` = route/page height; `inline` = compact block for client fetch */
  variant?: "full" | "inline";
};

/**
 * Loading shell for App Router `loading.tsx` and client bootstraps (replaces pulse skeletons).
 */
export function PageRouteLoading({
  title = "Loading…",
  subtitle,
  variant = "full",
}: PageRouteLoadingProps) {
  void title;
  void subtitle;
  void variant;
  return null;
}
