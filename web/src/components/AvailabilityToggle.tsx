"use client";

import { useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type AvailabilityStatus = "OPEN_NOW" | "OPEN_SOON" | "BOOKED";

interface AvailabilityToggleProps {
  currentStatus?: AvailabilityStatus;
  availableFrom?: string;
  onChange?: (status: AvailabilityStatus, availableFrom?: string) => void;
}

const statusConfig: Record<
  AvailabilityStatus,
  { label: string; emoji: string; color: string; bgColor: string; description: string }
> = {
  OPEN_NOW: {
    label: "Available Now",
    emoji: "🟢",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
    description: "Ready to take on new work immediately",
  },
  OPEN_SOON: {
    label: "Available Soon",
    emoji: "🟡",
    color: "#eab308",
    bgColor: "rgba(234, 179, 8, 0.1)",
    description: "Will be available from a specific date",
  },
  BOOKED: {
    label: "Fully Booked",
    emoji: "🔴",
    color: "#64748b",
    bgColor: "rgba(100, 116, 139, 0.1)",
    description: "Not taking new work at the moment",
  },
};

export function AvailabilityToggle({ currentStatus = "BOOKED", availableFrom, onChange }: AvailabilityToggleProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(currentStatus);
  const [date, setDate] = useState(availableFrom || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = useCallback(
    async (newStatus: AvailabilityStatus) => {
      setStatus(newStatus);

      if (newStatus !== "OPEN_SOON") {
        setIsSaving(true);
        try {
          const supabase = getSupabaseBrowser();
          if (!supabase) return;

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { error } = await supabase
            .from("profiles")
            .update({
              availability_status: newStatus,
              availability_updated_at: new Date().toISOString(),
              available_from: null,
            })
            .eq("id", user.id);

          if (error) throw error;
          onChange?.(newStatus, undefined);
        } catch {
          // Revert on error
          setStatus(currentStatus);
        } finally {
          setIsSaving(false);
          setIsOpen(false);
        }
      } else {
        // For OPEN_SOON, just update state, wait for date selection
        setStatus(newStatus);
      }
    },
    [currentStatus, date, onChange]
  );

  const handleDateConfirm = useCallback(async () => {
    if (!date) return;

    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          availability_status: "OPEN_SOON",
          available_from: date,
          availability_updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      onChange?.("OPEN_SOON", date);
      setIsOpen(false);
    } catch {
      setStatus(currentStatus);
    } finally {
      setIsSaving(false);
    }
  }, [currentStatus, date, onChange]);

  const config = statusConfig[status];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-80"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <span>{config.emoji}</span>
        <span>{config.label}</span>
        {isSaving && <span className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-outline-variant bg-surface-container p-3 shadow-lg">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Set Availability
          </div>

          <div className="space-y-2">
            {(Object.keys(statusConfig) as AvailabilityStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                  status === s ? "bg-surface-container-high" : "hover:bg-surface-container-high"
                }`}
              >
                <span className="text-xl">{statusConfig[s].emoji}</span>
                <div>
                  <div className="font-medium text-on-surface">{statusConfig[s].label}</div>
                  <div className="text-xs text-on-surface-variant">{statusConfig[s].description}</div>
                </div>
              </button>
            ))}
          </div>

          {status === "OPEN_SOON" && (
            <div className="mt-3 border-t border-outline-variant pt-3">
              <label className="mb-1 block text-xs text-on-surface-variant">Available From</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleDateConfirm}
                  disabled={!date || isSaving}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

// Compact display version for profile cards
export function AvailabilityBadge({ status, availableFrom }: { status?: AvailabilityStatus; availableFrom?: string }) {
  if (!status) return null;

  const config = statusConfig[status];
  let label = config.label;

  if (status === "OPEN_SOON" && availableFrom) {
    const date = new Date(availableFrom);
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) label = "Available Now";
    else if (daysUntil === 1) label = "Available Tomorrow";
    else label = `Available in ${daysUntil} days`;
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <span>{config.emoji}</span>
      <span>{label}</span>
    </span>
  );
}
