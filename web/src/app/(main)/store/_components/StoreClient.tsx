"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, apiGetJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";

type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  currency_type: string;
  honor_cost: number;
  conquest_cost: number;
  category: string | null;
  duration_days: number | null;
};

type PrivilegeRow = {
  privilege_slug: string;
  expires_at: string | null;
};

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const SECTIONS: { title: string; slugs: string[] }[] = [
  { title: "BOOSTS", slugs: ["listing_boost_7d", "profile_highlight", "deal_room_priority"] },
  { title: "FEATURES", slugs: ["extra_listing_slot", "reduced_fee_deal", "priority_placement"] },
  { title: "ACCESS & BADGES", slugs: ["early_feature_access", "verified_dealer_badge"] },
];

function costLabel(row: CatalogRow): string {
  if (row.currency_type === "honor" || (row.honor_cost > 0 && row.conquest_cost === 0)) {
    return `${row.honor_cost.toLocaleString()} Honor`;
  }
  if (row.currency_type === "conquest" || row.conquest_cost > 0) {
    return `${row.conquest_cost.toLocaleString()} Conquest`;
  }
  return "—";
}

function costClass(row: CatalogRow): string {
  if (row.honor_cost > 0 && row.conquest_cost === 0) return "text-secondary";
  return "text-on-surface";
}

export function StoreClient() {
  const { session, authReady } = useAuth();
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [privileges, setPrivileges] = useState<PrivilegeRow[]>([]);
  const [honor, setHonor] = useState(0);
  const [conquest, setConquest] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [modalSlug, setModalSlug] = useState<string | null>(null);
  const [purchaseErr, setPurchaseErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const userId = session?.user?.id ? String(session.user.id) : null;

  const activeBySlug = useMemo(() => {
    const m = new Map<string, PrivilegeRow>();
    for (const p of privileges) m.set(p.privilege_slug, p);
    return m;
  }, [privileges]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      let t = session?.access_token ?? null;
      if (!t) t = await getAccessToken();
      const catJson = await apiGetJson<{ privileges: CatalogRow[] }>("/api/privileges/catalog", t);
      setCatalog(Array.isArray(catJson.privileges) ? catJson.privileges : []);
      if (userId) {
        const [balJson, privJson] = await Promise.all([
          apiGetJson<{ honor_points: number; conquest_points: number }>(
            `/api/users/${encodeURIComponent(userId)}/currency`,
            t,
          ),
          apiGetJson<{ privileges: PrivilegeRow[] }>(`/api/users/${encodeURIComponent(userId)}/privileges`, t),
        ]);
        setHonor(Number(balJson.honor_points) || 0);
        setConquest(Number(balJson.conquest_points) || 0);
        setPrivileges(Array.isArray(privJson.privileges) ? privJson.privileges : []);
      } else {
        setHonor(0);
        setConquest(0);
        setPrivileges([]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load store");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, userId]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [authReady, load]);

  const modalRow = modalSlug ? catalog.find((c) => c.slug === modalSlug) : null;

  async function confirmPurchase() {
    if (!modalRow || !userId) return;
    setBusy(true);
    setPurchaseErr(null);
    try {
      let t = session?.access_token ?? null;
      if (!t) t = await getAccessToken();
      const { ok, data, status } = await apiFetch<{
        balances?: { honor_points: number; conquest_points: number };
        error?: string;
      }>("/api/privileges/purchase", {
        method: "POST",
        accessToken: t,
        body: JSON.stringify({ privilegeSlug: modalRow.slug }),
      });
      if (!ok) {
        setPurchaseErr((data as { error?: string })?.error || `Request failed (${status})`);
        setBusy(false);
        return;
      }
      const b = (data as { balances?: { honor_points: number; conquest_points: number } }).balances;
      if (b) {
        setHonor(Number(b.honor_points) || 0);
        setConquest(Number(b.conquest_points) || 0);
      }
      setModalSlug(null);
      await load();
    } catch (e) {
      setPurchaseErr(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-root pb-28">
      <div className="page-content mx-auto max-w-[960px]">
        <header className="mb-8">
          <p className="section-label">STORE</p>
          <h1 className="page-title">Honor &amp; Conquest</h1>
          <p className="page-subtitle max-w-[560px]">
            Spend your Honor and Conquest to unlock perks, boosts, and privileges.
          </p>
        </header>

        <div className="bg-surface-container-low border-outline-variant/60 mb-10 rounded-xl border p-5">
          <p className="section-label !mb-3">Your balance</p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-on-surface-variant text-[11px] font-headline font-600 uppercase tracking-wider">
                Honor
              </p>
              <p className="text-secondary font-headline text-2xl font-black tabular-nums">{honor.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[11px] font-headline font-600 uppercase tracking-wider">
                Conquest
              </p>
              <p
                className="font-headline text-2xl font-black tabular-nums"
                style={{ color: "var(--color-primary-container)" }}
              >
                {conquest.toLocaleString()}
              </p>
            </div>
          </div>
          {!userId ? (
            <p className="text-on-surface-variant mt-3 text-[13px]">Sign in to purchase privileges.</p>
          ) : null}
        </div>

        {loading ? <p className="text-on-surface-variant text-sm">Loading catalog…</p> : null}
        {err ? (
          <p className="text-error text-sm" role="alert">
            {err}
          </p>
        ) : null}

        {!loading &&
          SECTIONS.map((sec) => (
            <section key={sec.title} className="mb-10">
              <p className="section-label !mb-4">{sec.title}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sec.slugs.map((slug) => {
                  const row = catalog.find((c) => c.slug === slug);
                  if (!row) return null;
                  const active = activeBySlug.get(row.slug);
                  const dur =
                    row.duration_days != null
                      ? `${row.duration_days} day${row.duration_days === 1 ? "" : "s"}`
                      : "Permanent";
                  return (
                    <div
                      key={row.slug}
                      className="bg-surface-container-low border-outline-variant/60 flex flex-col rounded-xl border p-4"
                    >
                      <p className="text-on-surface-variant text-[11px] font-headline font-600 uppercase">
                        {row.category || "Item"}
                      </p>
                      <h2 className="font-headline mt-1 text-base font-700 text-on-surface">{row.name}</h2>
                      <p className="text-on-surface-variant mt-0.5 text-[11px]">{dur}</p>
                      <p className="text-on-surface-variant mt-2 line-clamp-2 min-h-[2.5rem] text-[13px] leading-snug">
                        {row.description || "—"}
                      </p>
                      <p className={`mt-4 text-sm font-headline font-600 tabular-nums ${costClass(row)}`}>
                        Cost: {costLabel(row)}
                      </p>
                      {active ? (
                        <span className="bg-low/15 text-low mt-3 inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-headline font-600">
                          {active.expires_at
                            ? `Active until ${new Date(active.expires_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`
                            : "Active"}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        disabled={!userId || Boolean(active)}
                        onClick={() => {
                          setPurchaseErr(null);
                          setModalSlug(row.slug);
                        }}
                        className="btn-primary mt-4 min-h-[40px] w-full disabled:opacity-40"
                      >
                        {active ? "Owned" : "Unlock"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

        {modalRow && userId ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-modal-title"
          >
            <div className="bg-surface-container-high border-outline-variant max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border p-6 shadow-xl">
              <h2 id="store-modal-title" className="font-headline text-lg font-700 text-on-surface">
                Confirm purchase
              </h2>
              <p className="text-on-surface-variant mt-3 text-[14px] leading-relaxed">
                Spend {costLabel(modalRow)} for <span className="text-on-surface font-500">{modalRow.name}</span>?
              </p>
              <p className="text-on-surface-variant mt-2 text-[13px]">
                Your balance:{" "}
                <span className="text-secondary font-600 tabular-nums">{honor.toLocaleString()} Honor</span>
                {" · "}
                <span className="font-600 tabular-nums" style={{ color: "var(--color-primary-container)" }}>
                  {conquest.toLocaleString()} Conquest
                </span>
              </p>
              {purchaseErr ? (
                <p className="text-error mt-3 text-sm" role="alert">
                  {purchaseErr}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="btn-primary min-h-[44px] flex-1" disabled={busy} onClick={confirmPurchase}>
                  {busy ? "Working…" : "Confirm"}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[44px] flex-1"
                  disabled={busy}
                  onClick={() => setModalSlug(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
