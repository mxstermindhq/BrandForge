"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CopyButton, PageHero, PageShell } from "@/components/content";
import { ACTIVE_CAMPAIGN, CAMPAIGN_ARCHIVE } from "@/content/launch/campaign";
import { PLATFORMS } from "@/content/launch/platforms";
import type { CampaignDay, CampaignPost, PlatformId } from "@/content/launch/types";

function daysRemaining(endDate: string): number {
  const end = new Date(`${endDate}T23:59:59`);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

function PlatformChecklist({
  campaignId,
  platforms,
}: {
  campaignId: string;
  platforms: readonly PlatformId[];
}): React.JSX.Element {
  const storageKey = `bf-launch-checklist-${campaignId}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = (platform: PlatformId): void => {
    const next = { ...checked, [platform]: !checked[platform] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {platforms.map((platform) => {
        const meta = PLATFORMS[platform];
        const done = Boolean(checked[platform]);
        return (
          <li key={platform}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-b1 bg-s1 p-3">
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggle(platform)}
                className="accent-accent"
              />
              <span className="font-mono text-[10px] uppercase" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <span className="ml-auto font-mono text-[9px] text-muted">
                {done ? "Posted ✓" : "Pending"}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function estToUtcHint(est: string): string {
  const parts = est.split(":");
  if (parts.length < 2) return "";
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const utcH = (h + 4) % 24;
  return `${String(utcH).padStart(2, "0")}:${String(m).padStart(2, "0")} UTC`;
}

function postCopyText(post: CampaignPost): string {
  if (post.title) return `${post.title}\n\n${post.body}`;
  return post.body;
}

function dayCopyText(day: CampaignDay): string {
  const header = `=== ${day.label} ${day.date} ===\n`;
  const blocks = day.posts.map((p) => {
    const platform = PLATFORMS[p.platform].label;
    const title = p.title ? `\n${p.title}` : "";
    return `[${p.timeEst} EST · ${platform}]${title}\n${p.body}`;
  });
  return header + blocks.join("\n\n---\n\n");
}

function PlatformBadge({ platform }: { platform: PlatformId }): React.JSX.Element {
  const meta = PLATFORMS[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border border-b1 bg-s2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={{ borderColor: `${meta.color}44`, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function PostCard({
  post,
  campaignStart,
}: {
  post: CampaignPost;
  campaignStart: { time: string; timezone: string };
}): React.JSX.Element {
  const copyText = postCopyText(post);
  const meta = PLATFORMS[post.platform];
  const isKickoff = post.kind === "kickoff";
  const timeLabel = isKickoff
    ? `${campaignStart.time} · ${campaignStart.timezone}`
    : `${post.timeEst} EST · ${estToUtcHint(post.timeEst)} EDT`;

  return (
    <article
      className={`rounded-md border bg-s1 p-5 ${
        isKickoff ? "border-accent shadow-[0_0_0_1px_var(--a-mid)]" : "border-b1"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={post.platform} />
          <span className="font-mono text-[10px] text-muted">{timeLabel}</span>
          {isKickoff ? (
            <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-[9px] uppercase text-accent-bright">
              Start here
            </span>
          ) : post.kind ? (
            <span className="rounded bg-s2 px-1.5 py-0.5 font-mono text-[9px] uppercase text-text-secondary">
              {post.kind}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase text-accent-bright hover:text-text"
          >
            Open →
          </a>
          <CopyButton text={copyText} label="Copy post" />
        </div>
      </div>

      {post.title ? (
        <h3 className="mt-4 text-sm font-bold text-text">{post.title}</h3>
      ) : null}

      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded border border-b1 bg-bg p-4 font-mono text-xs leading-relaxed text-text-secondary">
        {post.body}
      </pre>

      {post.notes ? (
        <p className="mt-3 border-t border-b1 pt-3 text-xs text-muted">
          <span className="font-mono uppercase tracking-wider text-amber">Note · </span>
          {post.notes}
        </p>
      ) : null}
    </article>
  );
}

export function LaunchCampaignClient(): React.JSX.Element {
  const campaign = ACTIVE_CAMPAIGN;
  const [activeDay, setActiveDay] = useState(campaign.days[0]?.key ?? "mon");
  const [platformFilter, setPlatformFilter] = useState<PlatformId | "all">("all");

  const currentDay = campaign.days.find((d) => d.key === activeDay) ?? campaign.days[0]!;

  const filteredPosts = useMemo(() => {
    if (platformFilter === "all") return currentDay.posts;
    return currentDay.posts.filter((p) => p.platform === platformFilter);
  }, [currentDay.posts, platformFilter]);

  const weekBrief = useMemo(
    () =>
      [
        `# ${campaign.weekLabel}`,
        campaign.dateRange,
        `Starts: ${campaign.campaignStart.dayLabel} ${campaign.campaignStart.date} at ${campaign.campaignStart.time} (${campaign.campaignStart.timezone})`,
        "",
        `Theme: ${campaign.theme}`,
        "",
        campaign.hook,
        "",
        "Key messages:",
        ...campaign.keyMessages.map((m) => `• ${m}`),
        "",
        "Avoid:",
        ...campaign.avoid.map((a) => `• ${a}`),
      ].join("\n"),
    [campaign],
  );

  const allPlatformsInWeek = useMemo(() => {
    const set = new Set<PlatformId>();
    for (const day of campaign.days) {
      for (const post of day.posts) set.add(post.platform);
    }
    return [...set];
  }, [campaign.days]);

  const handleCopyWeek = useCallback(async (): Promise<void> => {
    const text = campaign.days.map(dayCopyText).join("\n\n");
    await navigator.clipboard.writeText(text);
  }, [campaign.days]);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Launch", href: "/launch/" },
      ]}
      path="/launch/"
      showBreadcrumbs
    >
      <PageHero
        eyebrow="Launch campaign"
        title={
          <>
            Weekly outreach <em className="text-accent-bright not-italic">command centre</em>
          </>
        }
        subhead="Copy-paste posts for Discord, forums, Reddit, X, Threads, and LinkedIn. Campaign starts today — one file swap each week for fresh content."
      />

      <section className="border-b border-b1 py-10">
        <div className="content-wrap">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
                {campaign.id}
              </p>
              <h2 className="mt-1 text-2xl font-bold">{campaign.weekLabel}</h2>
              <p className="mt-1 text-sm text-muted">{campaign.dateRange}</p>
              <p className="mt-2 font-mono text-[10px] text-accent-bright">
                {daysRemaining(campaign.endDate)} day{daysRemaining(campaign.endDate) === 1 ? "" : "s"} remaining
              </p>
            </div>
            <CopyButton text={weekBrief} label="Copy week brief" />
          </div>

          <div className="mt-6 rounded-md border border-accent bg-accent/10 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
              Campaign starts
            </p>
            <p className="mt-2 text-lg font-bold text-text">
              {campaign.campaignStart.dayLabel} {campaign.campaignStart.date} at{" "}
              {campaign.campaignStart.time}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {campaign.campaignStart.timezone} — first post is Discord kickoff in{" "}
              <button
                type="button"
                onClick={() => setActiveDay("fri")}
                className="text-accent-bright underline-offset-2 hover:underline"
              >
                Day 1 (today)
              </button>
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-b1 bg-s1 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
                This week&apos;s theme
              </p>
              <p className="mt-2 text-sm text-text">{campaign.theme}</p>
              <p className="mt-3 text-sm text-text-secondary">{campaign.hook}</p>
            </div>
            <div className="rounded-md border border-b1 bg-s1 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
                Timezones
              </p>
              <p className="mt-2 text-sm text-text">{campaign.timezonePrimary}</p>
              <p className="mt-2 text-xs text-muted">{campaign.timezoneSecondary}</p>
            </div>
          </div>

          <div className="mt-8 rounded-md border border-b1 bg-s1 p-4">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
              Platform checklist
            </h3>
            <p className="mt-1 text-xs text-muted">Mark posted when live — saved in this browser.</p>
            <PlatformChecklist campaignId={campaign.id} platforms={allPlatformsInWeek} />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Best times to post
          </h2>
          <div className="mt-4 overflow-x-auto rounded-md border border-b1">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-b1 bg-s1 font-mono uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">EST window</th>
                  <th className="px-4 py-3">UTC window</th>
                  <th className="px-4 py-3">Why</th>
                </tr>
              </thead>
              <tbody>
                {campaign.postingGuide.map((row) => (
                  <tr key={row.platform} className="border-b border-b1 last:border-0">
                    <td className="px-4 py-3">
                      <PlatformBadge platform={row.platform} />
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{row.bestEst}</td>
                    <td className="px-4 py-3 font-mono text-muted">{row.bestUtc}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-y border-b1 bg-s1 py-10">
        <div className="content-wrap grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              Key messages
            </h2>
            <ul className="mt-4 space-y-2">
              {campaign.keyMessages.map((msg) => (
                <li key={msg} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-green">✓</span>
                  {msg}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber">
              Virality without being needy
            </h2>
            <ul className="mt-4 space-y-2">
              {campaign.avoid.map((rule) => (
                <li key={rule} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-amber">×</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="content-wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              Weekly calendar
            </h2>
            <button
              type="button"
              onClick={() => void handleCopyWeek()}
              className="rounded border border-b2 bg-s2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors hover:border-accent hover:text-text"
            >
              Copy full week
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {campaign.days.map((day) => {
              const active = day.key === activeDay;
              const count = day.posts.length;
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setActiveDay(day.key)}
                  className={`rounded border px-4 py-2 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10 text-text"
                      : "border-b1 bg-s1 text-text-secondary hover:border-b2 hover:text-text"
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase">{day.label}</span>
                  <span className="block text-xs text-muted">
                    {day.dayNumber ? `Day ${day.dayNumber} · ` : ""}
                    {day.date} · {count} post{count === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-muted">Filter:</span>
            <button
              type="button"
              onClick={() => setPlatformFilter("all")}
              className={`rounded border px-2 py-1 font-mono text-[10px] uppercase ${
                platformFilter === "all"
                  ? "border-accent text-text"
                  : "border-b1 text-muted hover:text-text"
              }`}
            >
              All
            </button>
            {allPlatformsInWeek.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPlatformFilter(id)}
                className={`rounded border px-2 py-1 font-mono text-[10px] uppercase ${
                  platformFilter === id
                    ? "border-accent text-text"
                    : "border-b1 text-muted hover:text-text"
                }`}
              >
                {PLATFORMS[id].label}
              </button>
            ))}
            <CopyButton
              text={dayCopyText(currentDay)}
              label={`Copy ${currentDay.label}`}
              className="ml-auto"
            />
          </div>

          <div className="mt-8 space-y-6">
            {filteredPosts.length === 0 ? (
              <p className="text-sm text-muted">No posts for this filter on {currentDay.label}.</p>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  campaignStart={campaign.campaignStart}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-b1 py-12">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Platform links
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.values(PLATFORMS).map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-b1 bg-s1 px-3 py-2 font-mono text-[10px] uppercase transition-colors hover:border-accent"
                style={{ color: p.color }}
              >
                {p.label}
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">
            To start a new campaign next week: edit{" "}
            <code className="rounded bg-s2 px-1 py-0.5 font-mono text-[10px]">
              src/content/launch/campaign.ts
            </code>{" "}
            — or run{" "}
            <code className="rounded bg-s2 px-1 py-0.5 font-mono text-[10px]">
              node scripts/generate-campaign.mjs
            </code>
            . Move the old week into{" "}
            <code className="rounded bg-s2 px-1 py-0.5 font-mono text-[10px]">
              CAMPAIGN_ARCHIVE
            </code>
            .
          </p>
        </div>
      </section>

      {CAMPAIGN_ARCHIVE.length > 0 ? (
        <section className="border-t border-b1 bg-s1 py-12">
          <div className="content-wrap">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              Campaign history
            </h2>
            <ul className="mt-6 space-y-4">
              {CAMPAIGN_ARCHIVE.map((past) => (
                <li key={past.id} className="rounded-md border border-b1 bg-bg p-5">
                  <p className="font-mono text-[10px] text-muted">{past.id}</p>
                  <h3 className="mt-1 text-lg font-bold">{past.weekLabel}</h3>
                  <p className="text-sm text-text-secondary">{past.dateRange}</p>
                  {past.results ? (
                    <p className="mt-3 font-mono text-[10px] text-accent-bright">
                      Clicks {past.results.clicks ?? "—"} · Joins {past.results.joins ?? "—"} ·
                      Conversions {past.results.conversions ?? "—"}
                    </p>
                  ) : null}
                  {past.learnings ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="font-mono text-[9px] uppercase text-green">What worked</p>
                        <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                          {past.learnings.worked.map((w) => (
                            <li key={w}>· {w}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] uppercase text-amber">What didn&apos;t</p>
                        <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                          {past.learnings.didnt.map((w) => (
                            <li key={w}>· {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
