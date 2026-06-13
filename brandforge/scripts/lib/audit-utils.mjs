#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BF_ROOT = path.resolve(__dirname, "../..");
export const REPO_ROOT = path.resolve(BF_ROOT, "..");
export const AUDIT_ROOT = path.join(REPO_ROOT, "audit");
export const OUT_DIR = path.join(BF_ROOT, "out");

export function timestampSlug(d = new Date()) {
  return d.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function writeLatest(dir, data, prefix = "latest") {
  const ts = timestampSlug();
  writeJson(path.join(dir, `${prefix}-${ts}.json`), data);
  writeJson(path.join(dir, `${prefix}.json`), data);
  return ts;
}

export function walkDir(dir, ext = null) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full, ext));
    else if (!ext || full.endsWith(ext)) out.push(full);
  }
  return out;
}

export function extractLighthouseMetrics(report) {
  const audits = report.audits ?? {};
  const perf = report.categories?.performance?.score ?? null;
  const num = (id) => audits[id]?.numericValue ?? null;
  return {
    performance: perf !== null ? Math.round(perf * 100) : null,
    lcp: num("largest-contentful-paint"),
    tbt: num("total-blocking-time"),
    cls: num("cumulative-layout-shift"),
    fcp: num("first-contentful-paint"),
    si: num("speed-index"),
  };
}

export function collectLighthouseHistory() {
  const points = [];

  const pushPoint = (label, filePath, source) => {
    const raw = readJson(filePath);
    if (!raw) return;
    let metrics;
    if (raw.homeMobile) {
      metrics = raw.homeMobile;
    } else if (raw.categories?.performance) {
      metrics = extractLighthouseMetrics(raw);
    } else if (typeof raw.perf === "number") {
      metrics = { performance: raw.perf, lcp: raw.lcp, tbt: raw.tbt, cls: raw.cls };
    } else if (typeof raw.performance === "number") {
      metrics = raw;
    }
    if (!metrics?.performance) return;
    points.push({
      label,
      source,
      date: raw.auditedAt ?? raw.date ?? raw.fetchTime ?? null,
      homeMobile: metrics.performance,
      lcp: metrics.lcp ?? null,
      tbt: metrics.tbt ?? null,
      cls: metrics.cls ?? null,
      siteWideAverage: raw.siteWideAverage ?? raw.avgPerformance ?? null,
    });
  };

  pushPoint("Sprint 3", path.join(AUDIT_ROOT, "sprint-3/home-mobile-summary.json"), "sprint-3");
  pushPoint("Sprint 4", path.join(AUDIT_ROOT, "sprint-4/home-mobile.json"), "sprint-4");
  pushPoint("Sprint 5", path.join(AUDIT_ROOT, "sprint-5/perf-final.json"), "sprint-5");
  pushPoint("Sprint 5 live", path.join(AUDIT_ROOT, "sprint-5/home-mobile-live.json"), "sprint-5-live");
  pushPoint("Sprint 7", path.join(AUDIT_ROOT, "sprint-7/home-mobile-final.json"), "sprint-7");

  const perfAll = readJson(path.join(AUDIT_ROOT, "brandforge-perf-all.json"));
  if (perfAll) {
    const home = perfAll.pages?.find((p) => p.path === "/");
    points.push({
      label: "Site-wide audit",
      source: "brandforge-perf-all",
      date: perfAll.auditedAt,
      homeMobile: home?.performance ?? null,
      lcp: home?.lcp ?? null,
      tbt: home?.tbt ?? null,
      cls: home?.cls ?? null,
      siteWideAverage: perfAll.avgPerformance ?? null,
    });
  }

  return points.filter((p) => p.homeMobile !== null);
}

export function regressionFlags(history, threshold = 10) {
  const flags = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    if (prev.homeMobile - curr.homeMobile >= threshold) {
      flags.push({
        from: prev.label,
        to: curr.label,
        drop: prev.homeMobile - curr.homeMobile,
      });
    }
  }
  return flags;
}
