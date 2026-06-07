"use client";

import * as React from "react";
import { useMe } from "@/components/app/AppShell";
import {
  Button,
  Card,
  Input,
  Spinner,
  StatCard,
} from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import { AdminOpsPanel } from "@/components/admin/AdminOpsPanel";
import type { AdminStats, AdminUserRow, PaginatedResponse } from "@/types";

export default function AdminPage(): React.JSX.Element {
  const { me } = useMe();
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [users, setUsers] = React.useState<AdminUserRow[] | null>(null);
  const [grants, setGrants] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(() => {
    apiFetch<PaginatedResponse<AdminUserRow>>("/api/admin/users?limit=50")
      .then((r) => setUsers(r.items))
      .catch(() => setUsers([]));
  }, []);

  React.useEffect(() => {
    if (!me.user.is_admin) return;
    apiFetch<AdminStats>("/api/admin/stats").then(setStats).catch(() => setStats(null));
    loadUsers();
  }, [me.user.is_admin, loadUsers]);

  if (!me.user.is_admin) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl font-light">Not authorized</h1>
        <p className="mt-2 text-tx-muted">This area is restricted to administrators.</p>
      </div>
    );
  }

  async function grant(userId: string): Promise<void> {
    const amount = Number(grants[userId]);
    if (!Number.isFinite(amount) || amount === 0) return;
    setBusy(userId);
    try {
      await apiFetch("/api/admin/credits", {
        method: "POST",
        json: { userId, amount },
      });
      setGrants((g) => ({ ...g, [userId]: "" }));
      loadUsers();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-light">Admin</h1>
      <p className="mt-1 text-tx-muted">Platform overview and user management.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Users" value={stats ? stats.totalUsers : "—"} accent />
        <StatCard label="Campaigns" value={stats ? stats.totalCampaigns : "—"} />
        <StatCard label="Leads" value={stats ? stats.totalLeads.toLocaleString() : "—"} />
        <StatCard
          label="Revenue"
          value={stats ? `$${(stats.totalRevenueCents / 100).toFixed(0)}` : "—"}
        />
        <StatCard
          label="Avg completion"
          value={stats ? `${Math.round(stats.avgCompletionRate * 100)}%` : "—"}
        />
        <StatCard label="Leads today" value={stats ? stats.leadsDeliveredToday : "—"} />
      </div>

      <h2 className="mt-12 font-display text-2xl font-light">Users</h2>
      <div className="mt-4">
        {users === null ? (
          <div className="flex justify-center py-10 text-gold">
            <Spinner />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-tx-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Campaigns</th>
                  <th className="px-4 py-3 font-medium">Grant credits</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-tx">
                        {u.name}
                        {u.is_admin && <span className="ml-2 text-xs text-gold">admin</span>}
                      </p>
                      <p className="text-xs text-tx-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">{u.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">{u.campaign_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={grants[u.id] ?? ""}
                          onChange={(e) =>
                            setGrants((g) => ({ ...g, [u.id]: e.target.value }))
                          }
                          placeholder="±"
                          className="w-24 py-1"
                        />
                        <Button
                          variant="secondary"
                          loading={busy === u.id}
                          onClick={() => grant(u.id)}
                          className="py-1"
                        >
                          Apply
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <AdminOpsPanel />
    </div>
  );
}
