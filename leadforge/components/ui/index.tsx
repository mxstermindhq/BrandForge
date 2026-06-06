import * as React from "react";

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}): React.JSX.Element {
  const base =
    "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-gold text-bg hover:bg-gold-light",
    secondary: "border border-border text-tx hover:border-border-hover",
    ghost: "text-tx-muted hover:text-tx",
    danger: "border border-status-rejected text-status-rejected hover:bg-status-rejected/10",
  };
  return (
    <button
      className={cx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cx("rounded-lg border border-border bg-bg-surface", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const map: Record<string, string> = {
    new: "bg-status-new/15 text-status-new",
    contacted: "bg-status-contacted/15 text-status-contacted",
    qualified: "bg-status-qualified/15 text-status-qualified",
    rejected: "bg-status-rejected/20 text-tx-muted",
    queued: "bg-status-new/15 text-status-new",
    running: "bg-gold-bg text-gold",
    complete: "bg-status-qualified/15 text-status-qualified",
    failed: "bg-status-rejected/20 text-status-rejected",
    cancelled: "bg-status-rejected/20 text-tx-muted",
    paused: "bg-status-contacted/15 text-status-contacted",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        map[status] ?? "bg-border text-tx-muted",
      )}
    >
      {status}
    </span>
  );
}

export function FitBadge({ label }: { label: string | null }): React.JSX.Element | null {
  if (!label) return null;
  const map: Record<string, string> = {
    Hot: "bg-status-rejected/15 text-[#e06666]",
    Warm: "bg-status-contacted/15 text-status-contacted",
    Cold: "bg-status-new/15 text-status-new",
  };
  return (
    <span className={cx("rounded px-2 py-0.5 text-xs", map[label] ?? "bg-border text-tx-muted")}>
      {label}
    </span>
  );
}

// ── Inputs ─────────────────────────────────────────────────────────────────────
const fieldBase =
  "w-full rounded border border-border bg-bg px-3 py-2 text-sm text-tx placeholder:text-tx-muted/60 focus:border-gold focus:outline-none";

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
): React.JSX.Element {
  return <input {...props} className={cx(fieldBase, props.className)} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
): React.JSX.Element {
  return <textarea {...props} className={cx(fieldBase, "min-h-[90px] resize-y", props.className)} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
): React.JSX.Element {
  return <select {...props} className={cx(fieldBase, props.className)} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-tx-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-tx-muted">{hint}</span>}
    </label>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }): React.JSX.Element {
  return (
    <span
      className={cx(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className ?? "h-5 w-5",
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

// ── Empty / error / stat ─────────────────────────────────────────────────────────
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-border py-16 text-center">
      <h3 className="font-display text-2xl font-light text-tx">{title}</h3>
      {body && <p className="mx-auto mt-2 max-w-sm text-sm text-tx-muted">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}): React.JSX.Element {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-tx-muted">{label}</p>
      <p className={cx("mt-2 font-mono text-3xl", accent ? "text-gold" : "text-tx")}>{value}</p>
    </Card>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }): React.JSX.Element | null {
  if (!children) return null;
  return <p className="text-sm text-status-rejected">{children}</p>;
}
