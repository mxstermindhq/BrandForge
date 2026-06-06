"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMe } from "@/components/app/AppShell";
import {
  Button,
  Card,
  Spinner,
  StatCard,
} from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import { PACKS } from "@/lib/constants";
import type { CreditBalance, Transaction } from "@/types";

interface BalanceResponse {
  balance: CreditBalance;
  transactions: Transaction[];
}

export default function BillingPage(): React.JSX.Element {
  return (
    <React.Suspense fallback={null}>
      <Billing />
    </React.Suspense>
  );
}

function Billing(): React.JSX.Element {
  const { me, refresh } = useMe();
  const params = useSearchParams();
  const statusParam = params.get("status");
  const [data, setData] = React.useState<BalanceResponse | null>(null);
  const [buying, setBuying] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    apiFetch<BalanceResponse>("/api/billing/balance").then(setData).catch(() => setData(null));
    if (statusParam === "success") void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam]);

  async function buy(packId: string): Promise<void> {
    setBuying(packId);
    setError("");
    try {
      const { url } = await apiFetch<{ url: string }>("/api/billing/checkout", {
        method: "POST",
        json: { packId },
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout unavailable");
      setBuying(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-light">Billing</h1>
      <p className="mt-1 text-tx-muted">Buy credits and review your purchase history.</p>

      {statusParam === "success" && (
        <p className="mt-4 rounded border border-status-qualified/40 bg-status-qualified/10 p-3 text-sm text-status-qualified">
          Payment successful — your credits have been added.
        </p>
      )}
      {statusParam === "cancelled" && (
        <p className="mt-4 rounded border border-border bg-bg-surface p-3 text-sm text-tx-muted">
          Checkout cancelled. No charge was made.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current balance" value={me.credits.balance.toLocaleString()} accent />
        <StatCard
          label="Lifetime purchased"
          value={me.credits.lifetime_purchased.toLocaleString()}
        />
      </div>

      <h2 className="mt-12 font-display text-2xl font-light">Credit packs</h2>
      {error && <p className="mt-3 text-sm text-status-rejected">{error}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKS.map((pack, i) => (
          <Card key={pack.id} className={`p-6 ${i === 1 ? "border-gold" : ""}`}>
            <h3 className="text-lg text-gold">{pack.name}</h3>
            <p className="mt-2 font-mono text-3xl">${pack.priceUsd}</p>
            <p className="mt-1 text-sm text-tx-muted">{pack.credits.toLocaleString()} credits</p>
            <Button
              loading={buying === pack.id}
              onClick={() => buy(pack.id)}
              className="mt-5 w-full"
            >
              Buy
            </Button>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-light">History</h2>
      <div className="mt-4">
        {data === null ? (
          <div className="flex justify-center py-10 text-gold">
            <Spinner />
          </div>
        ) : data.transactions.length === 0 ? (
          <p className="text-sm text-tx-muted">No purchases yet.</p>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-tx-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 text-tx-muted">{t.created_at}</td>
                    <td className="px-4 py-3 font-mono">{t.credits_purchased.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">${(t.amount_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 capitalize text-tx-muted">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
