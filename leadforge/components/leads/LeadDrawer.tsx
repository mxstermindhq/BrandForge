"use client";

import * as React from "react";
import { Button, FitBadge, StatusBadge, Textarea } from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import type { ColdEmailOutput, Lead, LeadStatus } from "@/types";

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [raw];
  }
}

const SOCIALS: { key: keyof Lead; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "instagram_url", label: "Instagram" },
  { key: "twitter_handle", label: "X / Twitter" },
  { key: "youtube_channel", label: "YouTube" },
  { key: "tiktok_handle", label: "TikTok" },
];

export function LeadDrawer({
  lead,
  onClose,
  onStatus,
  onNotesSaved,
}: {
  lead: Lead;
  onClose: () => void;
  onStatus: (next: LeadStatus) => Promise<void>;
  onNotesSaved: (updated: Lead) => void;
}): React.JSX.Element {
  const [notes, setNotes] = React.useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [email, setEmail] = React.useState<ColdEmailOutput | null>(null);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const needs = parseList(lead.likely_needs);
  const flags = parseList(lead.red_flags);

  async function saveNotes(): Promise<void> {
    setSavingNotes(true);
    try {
      const updated = await apiFetch<Lead>(`/api/leads/${lead.id}`, {
        method: "PATCH",
        json: { notes },
      });
      onNotesSaved(updated);
    } finally {
      setSavingNotes(false);
    }
  }

  async function generateEmail(): Promise<void> {
    setEmailLoading(true);
    setEmailError("");
    try {
      const result = await apiFetch<ColdEmailOutput>(`/api/leads/${lead.id}/cold-email`, {
        method: "POST",
      });
      setEmail(result);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Could not generate email");
    } finally {
      setEmailLoading(false);
    }
  }

  async function copyEmail(): Promise<void> {
    if (!email) return;
    await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-black/50"
      />
      <div className="w-full max-w-md overflow-y-auto border-l border-border bg-bg-surface p-6 animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-light">{lead.company_name ?? "Lead"}</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-lg text-gold">{lead.score}</span>
              <FitBadge label={lead.fit_label} />
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-tx-muted hover:text-tx">
            ✕
          </button>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Contact" value={lead.contact_name} />
          <Row label="Email" value={lead.email} mono />
          <Row label="Phone" value={lead.phone} mono />
          <Row label="Niche" value={lead.niche} />
          <Row label="Location" value={lead.location} />
          <Row label="Size" value={lead.estimated_size} />
        </dl>

        <div className="mt-4 space-y-1.5">
          {SOCIALS.map(({ key, label }) => {
            const url = lead[key] as string | null;
            if (!url) return null;
            const href = url.startsWith("http") ? url : `https://${url}`;
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-xs text-status-new hover:underline"
              >
                {label}: {url}
              </a>
            );
          })}
        </div>

        {lead.pitch_angle && (
          <div className="mt-6 rounded border border-gold-muted/40 bg-gold-bg p-4">
            <p className="text-xs uppercase tracking-wide text-gold">Pitch angle</p>
            <p className="mt-1.5 text-sm text-tx">{lead.pitch_angle}</p>
          </div>
        )}

        {needs.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-tx-muted">Likely needs</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {needs.map((n, i) => (
                <li key={i} className="rounded bg-bg-raised px-2 py-1 text-xs text-tx">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}

        {flags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-status-rejected">Red flags</p>
            <ul className="mt-2 space-y-1 text-xs text-tx-muted">
              {flags.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-tx-muted">Cold email</p>
            <Button variant="secondary" loading={emailLoading} onClick={generateEmail}>
              {email ? "Regenerate" : "Generate"}
            </Button>
          </div>
          {emailError && <p className="mt-2 text-xs text-status-rejected">{emailError}</p>}
          {email && (
            <div className="mt-3 rounded border border-border bg-bg p-3">
              <p className="text-sm font-medium text-tx">{email.subject}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-tx-muted">{email.body}</p>
              <button onClick={copyEmail} className="mt-3 text-xs text-gold hover:underline">
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-tx-muted">Notes</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
            placeholder="Add a private note…"
          />
          <Button
            variant="secondary"
            loading={savingNotes}
            onClick={saveNotes}
            className="mt-2"
          >
            Save notes
          </Button>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-tx-muted">Set status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["new", "contacted", "qualified", "rejected"] as LeadStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => onStatus(s)}
                className={`rounded px-3 py-1.5 text-xs capitalize transition ${
                  lead.status === s
                    ? "bg-gold text-bg"
                    : "border border-border text-tx-muted hover:text-tx"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-tx-muted">{label}</dt>
      <dd className={`text-right text-tx ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
