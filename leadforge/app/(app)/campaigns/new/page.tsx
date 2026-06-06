"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/components/app/AppShell";
import {
  Button,
  Card,
  ErrorText,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import { PLATFORMS, calculateCampaignCost } from "@/lib/constants";
import type { CampaignType, CampaignView } from "@/types";

export default function NewCampaignPage(): React.JSX.Element {
  const router = useRouter();
  const { me, refresh } = useMe();

  const [type, setType] = React.useState<CampaignType>("b2b");
  const [name, setName] = React.useState("");
  const [productName, setProductName] = React.useState("");
  const [productDescription, setProductDescription] = React.useState("");
  const [targetDescription, setTargetDescription] = React.useState("");
  const [pricePoint, setPricePoint] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [quantity, setQuantity] = React.useState(100);
  const [enrich, setEnrich] = React.useState(true);
  const [platforms, setPlatforms] = React.useState<string[]>(["google", "web"]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const available = PLATFORMS.filter((p) => (type === "b2b" ? p.b2b : p.b2c));

  function switchType(next: CampaignType): void {
    setType(next);
    setPlatforms((prev) =>
      prev.filter((id) => {
        const p = PLATFORMS.find((x) => x.id === id);
        return p && (next === "b2b" ? p.b2b : p.b2c);
      }),
    );
  }

  function togglePlatform(id: string): void {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const cost =
    platforms.length > 0 ? calculateCampaignCost(quantity, platforms, enrich) : 0;
  const affordable = cost <= me.credits.balance;

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    if (platforms.length === 0) {
      setError("Select at least one source.");
      return;
    }
    if (!affordable) {
      setError("Not enough credits for this campaign.");
      return;
    }
    setLoading(true);
    try {
      const campaign = await apiFetch<CampaignView>("/api/campaigns", {
        method: "POST",
        json: {
          type,
          name,
          product_name: productName,
          product_description: productDescription || null,
          target_description: targetDescription,
          price_point: pricePoint,
          location: location || null,
          quantity_requested: Number(quantity),
          platforms,
          enrich,
        },
      });
      await refresh();
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create campaign");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-light">New campaign</h1>
      <p className="mt-1 text-tx-muted">
        Describe what you sell and who you want to reach.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5 p-6">
            <Field label="Campaign type">
              <div className="flex gap-3">
                {(["b2b", "b2c"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => switchType(t)}
                    className={`flex-1 rounded border px-4 py-3 text-sm font-medium transition ${
                      type === t
                        ? "border-gold bg-gold-bg text-gold"
                        : "border-border text-tx-muted hover:border-border-hover"
                    }`}
                  >
                    {t === "b2b" ? "B2B — businesses" : "B2C — consumers"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Campaign name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q3 plumber outreach"
                required
              />
            </Field>

            <Field label="Product / service name">
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Scheduling SaaS for plumbers"
                required
              />
            </Field>

            <Field label="Product description" hint="Optional — helps the AI score fit.">
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="What it does and the problem it solves."
              />
            </Field>

            <Field label="Ideal customer">
              <Textarea
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="Small plumbing companies in the US with 2–20 staff."
                required
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Price point">
                <Input
                  value={pricePoint}
                  onChange={(e) => setPricePoint(e.target.value)}
                  placeholder="$99/mo"
                  required
                />
              </Field>
              <Field label="Location" hint="Optional">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="United States"
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <Field label="Sources">
              <div className="grid gap-3 sm:grid-cols-2">
                {available.map((p) => {
                  const on = platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-start gap-3 rounded border p-3 text-left transition ${
                        on ? "border-gold bg-gold-bg" : "border-border hover:border-border-hover"
                      }`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.creditCost > 1 && (
                            <span className="text-xs text-gold">×{p.creditCost}</span>
                          )}
                        </span>
                        <span className="block text-xs text-tx-muted">{p.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <Field label="Number of leads">
              <Input
                type="number"
                min={1}
                max={5000}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </Field>

            <Field label="AI enrichment" hint="Scores, fit labels, and pitch angles. +50% cost.">
              <Select
                value={enrich ? "yes" : "no"}
                onChange={(e) => setEnrich(e.target.value === "yes")}
              >
                <option value="yes">Enabled (recommended)</option>
                <option value="no">Disabled — raw contacts only</option>
              </Select>
            </Field>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-tx-muted">Estimated cost</span>
                <span className="font-mono text-2xl text-gold">{cost.toLocaleString()}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-tx-muted">
                <span>Your balance</span>
                <span className="font-mono">{me.credits.balance.toLocaleString()}</span>
              </div>
              {!affordable && (
                <p className="mt-3 text-xs text-status-rejected">
                  Not enough credits — reduce quantity or top up.
                </p>
              )}
            </div>

            <ErrorText>{error}</ErrorText>

            <Button type="submit" loading={loading} disabled={!affordable} className="w-full">
              Launch campaign
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
