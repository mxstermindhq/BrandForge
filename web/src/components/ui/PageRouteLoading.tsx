import { cn } from "@/lib/cn";

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
  const full = variant === "full";
  return (
    <div
      className={cn(
        "from-background via-primary/[0.03] to-background flex w-full flex-col items-center justify-center bg-gradient-to-b px-6",
        full ? "min-h-[calc(100dvh-6.5rem)] py-12" : "min-h-[14rem] py-10",
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "border-primary/25 shadow-ambient relative rounded-full border-2 bg-surface-container-low/30 backdrop-blur-sm",
          full ? "h-14 w-14" : "h-10 w-10",
        )}
        aria-hidden
      >
        <span className="border-t-primary absolute inset-0 animate-spin rounded-full border-2 border-transparent" />
      </div>
      <p className="font-headline text-on-surface mt-6 text-center text-sm font-bold tracking-wide">{title}</p>
      {subtitle ? (
        <p className="text-on-surface-variant mt-2 max-w-sm text-center text-xs font-light leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
