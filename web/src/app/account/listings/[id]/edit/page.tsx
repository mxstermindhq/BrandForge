"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ListingForm, type ListingFormValues } from "@/components/listings/ListingForm";
import { ForgePage } from "@/components/forge/ForgePage";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { normalizeServiceDetail } from "@/lib/service-types";
import { useAuth } from "@/providers/AuthProvider";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditListingPage() {
  const params = useParams();
  const id = String(params.id || "");
  const router = useRouter();
  const { session, accessToken, authReady } = useAuth();
  const [values, setValues] = useState<ListingFormValues | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !id) return;
    const data = await apiGetJson<{ service?: Record<string, unknown> }>(
      `/api/services/${encodeURIComponent(id)}`,
      accessToken,
    );
    const s = normalizeServiceDetail(data.service || {});
    setValues({
      listingTerm: s.listingType === "long_term" ? "long" : "short",
      title: s.title,
      category: s.category,
      price: String(s.price),
      delivery: String(s.deliveryDays),
      description: s.description,
      endsAt: toDateInput(s.endsAt),
      billingInterval: s.billingInterval || "monthly",
      status: s.status || "published",
    });
  }, [accessToken, id]);

  useEffect(() => {
    if (authReady && !session) router.replace(`/login?next=/account/listings/${id}/edit`);
  }, [authReady, session, router, id]);

  useEffect(() => {
    void load().catch(() => setError("Could not load listing"));
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !values) return;
    setBusy(true);
    setError(null);
    try {
      await apiMutateJson(`/api/services/${encodeURIComponent(id)}`, "PUT", {
        title: values.title.trim(),
        category: values.category,
        price: values.price.trim(),
        delivery: values.delivery.trim(),
        description: values.description.trim(),
        listing_type: values.listingTerm === "long" ? "long_term" : "short_term",
        ends_at: values.listingTerm === "short" && values.endsAt ? values.endsAt : null,
        billing_interval: values.listingTerm === "long" ? values.billingInterval : null,
        status: values.status,
      }, accessToken);
      router.push("/account/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (!values) {
    return (
      <ForgePage title="Edit listing" narrow backHref="/account/listings" backLabel="← Listings">
        <p className="text-sm text-[var(--forge-text-muted)]">{error || "Loading…"}</p>
      </ForgePage>
    );
  }

  return (
    <ForgePage
      title="Edit listing"
      eyebrow="Seller"
      description="Update copy, price, and term type. Changes go live when status is published."
      narrow
      backHref="/account/listings"
      backLabel="← Listings"
    >
      <div className="forge-page-card mx-auto max-w-lg">
        <ListingForm
          values={values}
          onChange={setValues}
          submitLabel="Save listing"
          busy={busy}
          error={error}
          onSubmit={submit}
        />
      </div>
    </ForgePage>
  );
}
