"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  Spinner,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { LeadsView } from "@/components/leads/LeadsView";
import { apiFetch, ApiError } from "@/lib/client/api";
import type { CampaignLeadBreakdown, CampaignView } from "@/types";

interface DetailResponse {
  campaign: CampaignView;
  breakdown: CampaignLeadBreakdown;
}

const ACTIVE_STATUSES = ["queued", "running"];

export default function CampaignDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [detail, setDetail] = React.useState<DetailResponse | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await apiFetch<DetailResponse>(`/api/campaigns/${id}`);
      setDetail(data);
      return data.campaign.status;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      return null;
    }
  }, [id]);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function poll(): Promise<void> {
      if (cancelled) return;
      const status = await load();
      if (!cancelled && status && ACTIVE_STATUSES.includes(status)) {
        // Poll the lightweight status endpoint while the run is active.
        timer = setTimeout(poll, 3000);
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [load]);

  async function cancel(): Promise<void> {
    setCancelling(true);
    try {
      await apiFetch(`/api/campaigns/${id}`, { method: "DELETE" });
      router.refresh();
      await load();
    } finally {
      setCancelling(false);
    }
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl font-light">Campaign not found</h1>
        <Link href="/campaigns" className="mt-4 inline-block text-gold hover:underline">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex justify-center py-16 text-gold">
        <Spinner />
      </div>
    );
  }

  const { campaign, breakdown } = detail;
  const active = ACTIVE_STATUSES.includes(campaign.status);
  const pct =
    campaign.quantity_requested > 0
      ? Math.min(100, Math.round((campaign.quantity_delivered / campaign.quantity_requested) * 100))
      : 0;

  return (
    <div>
      <Link href="/campaigns" className="text-sm text-tx-muted hover:text-tx">
        ← Campaigns
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-light">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="mt-1 text-tx-muted">
            {campaign.type.toUpperCase()} · {campaign.product_name} · {campaign.price_point}
          </p>
        </div>
        {(campaign.status === "queued" || campaign.status === "failed") && (
          <Button variant="danger" loading={cancelling} onClick={cancel}>
            Cancel &amp; refund
          </Button>
        )}
      </div>

      {campaign.error_message && (
        <p className="mt-4 rounded border border-status-rejected/40 bg-status-rejected/10 p-3 text-sm text-status-rejected">
          {campaign.error_message}
        </p>
      )}

      {active && (
        <Card className="mt-6 p-5">
          <div className="flex items-center gap-3 text-sm text-gold">
            <Spinner className="h-4 w-4" />
            {campaign.status === "queued" ? "Queued — starting soon…" : "Finding and enriching leads…"}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-raised">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${Math.max(pct, active ? 6 : 0)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-tx-muted">
            {campaign.quantity_delivered}/{campaign.quantity_requested} delivered
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Delivered" value={`${campaign.quantity_delivered}/${campaign.quantity_requested}`} accent />
        <StatCard label="New" value={breakdown.new} />
        <StatCard label="Qualified" value={breakdown.qualified} />
        <StatCard label="Credits used" value={campaign.credits_used} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl font-light">Leads</h2>
        <div className="mt-4">
          <LeadsView campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
}
