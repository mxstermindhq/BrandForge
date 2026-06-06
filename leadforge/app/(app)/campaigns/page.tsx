"use client";

import * as React from "react";
import Link from "next/link";
import {
  Button,
  Card,
  EmptyState,
  Spinner,
  StatusBadge,
} from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import type { CampaignView, PaginatedResponse } from "@/types";

export default function CampaignsPage(): React.JSX.Element {
  const [data, setData] = React.useState<PaginatedResponse<CampaignView> | null>(null);

  React.useEffect(() => {
    apiFetch<PaginatedResponse<CampaignView>>("/api/campaigns?limit=50")
      .then(setData)
      .catch(() => setData({ items: [], total: 0, page: 1, totalPages: 1, limit: 50 }));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-light">Campaigns</h1>
        <Link href="/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>

      <div className="mt-8">
        {data === null ? (
          <div className="flex justify-center py-16 text-gold">
            <Spinner />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            body="Describe your ideal customer and we'll find matching leads."
            action={
              <Link href="/campaigns/new">
                <Button>Create your first campaign</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {data.items.map((c) => (
              <Link key={c.id} href={`/campaigns/${c.id}`}>
                <Card className="flex items-center justify-between p-5 hover:border-border-hover">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="mt-0.5 text-sm text-tx-muted">
                      {c.type.toUpperCase()} · {c.product_name} ·{" "}
                      {c.platforms.length} source{c.platforms.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 pl-4">
                    <div className="text-right">
                      <p className="font-mono text-lg">
                        {c.quantity_delivered}
                        <span className="text-tx-muted">/{c.quantity_requested}</span>
                      </p>
                      <p className="text-xs text-tx-muted">leads</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
