import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Read `wrangler.jsonc` `vars` so `next build` inlines them when CI only sets Worker runtime env (common on Cloudflare Git builds). */
function readWranglerJsoncVars(wranglerPath) {
  try {
    const raw = fs.readFileSync(wranglerPath, "utf8");
    const withoutFullLineComments = raw
      .split("\n")
      .filter((line) => !/^\s*\/\//.test(line))
      .join("\n");
    const parsed = JSON.parse(withoutFullLineComments);
    return parsed.vars && typeof parsed.vars === "object" ? parsed.vars : {};
  } catch {
    return {};
  }
}

const wranglerVars = readWranglerJsoncVars(path.join(__dirname, "wrangler.jsonc"));

/**
 * Prefer real `process.env` (e.g. Cloudflare **build** vars, `.env.local`). Fall back to `wrangler.jsonc` in production builds
 * so `NEXT_PUBLIC_*` reach the client bundle. In `next dev`, do not fall back API proxy URLs to wrangler (keep localhost default).
 */
function envResolved(key) {
  const p = process.env[key];
  if (p != null && String(p).trim() !== "") return String(p).trim();
  const skipWranglerInDev =
    process.env.NODE_ENV === "development" &&
    (key === "NEXT_PUBLIC_API_URL" || key === "API_PROXY_DESTINATION");
  if (skipWranglerInDev) return "";
  const w = wranglerVars[key];
  if (w != null && String(w).trim() !== "") return String(w).trim();
  return "";
}

/**
 * API proxy (rewrites — used heavily by `next dev`):
 * - On Cloudflare Workers, **`src/middleware.ts`** proxies `/api/*` to the Node API; OpenNext often does not honor external
 *   rewrites here. Keep `API_PROXY_DESTINATION` / `NEXT_PUBLIC_API_URL` in `wrangler.jsonc` `vars` (and build env).
 * - Rewrites below still help local dev and SSR paths that hit the Node server directly.
 */
function hasRemotePublicApiUrl() {
  const raw = String(envResolved("NEXT_PUBLIC_API_URL") || "")
    .trim()
    .replace(/\/+$/, "");
  if (!raw) return false;
  try {
    const h = new URL(raw).hostname;
    return h !== "localhost" && h !== "127.0.0.1" && h !== "[::1]";
  } catch {
    return false;
  }
}

const backendBase = String(
  envResolved("API_PROXY_DESTINATION") || envResolved("NEXT_PUBLIC_API_URL") || "http://127.0.0.1:3000",
).replace(/\/+$/, "");

const apiRewriteRules = [{ source: "/api/:path*", destination: `${backendBase}/api/:path*` }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Keep tracing scoped to `web/` so `output: standalone` lays out `.next/standalone/.next/...` (OpenNext expects this). A repo-root tracing root nests `standalone/web/.next` and breaks @opennextjs/cloudflare on Windows/CI.
  outputFileTracingRoot: __dirname,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: envResolved("NEXT_PUBLIC_APP_URL"),
    NEXT_PUBLIC_API_URL: envResolved("NEXT_PUBLIC_API_URL"),
    NEXT_PUBLIC_SUPABASE_URL: envResolved("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: envResolved("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    API_PROXY_DESTINATION: envResolved("API_PROXY_DESTINATION"),
  },
  async redirects() {
    return [
      { source: "/", destination: "/login", permanent: false },
      { source: "/messages", destination: "/chat", permanent: true },
      { source: "/messages/:id", destination: "/chat/:id", permanent: true },
      { source: "/ai/copilot", destination: "/ai/chat", permanent: true },
      { source: "/ai/copilot/:path*", destination: "/ai/chat/:path*", permanent: true },
    ];
  },
  async rewrites() {
    const proxyOn =
      process.env.NEXT_PUBLIC_USE_API_PROXY === "1" ||
      Boolean(String(envResolved("API_PROXY_DESTINATION") || "").trim()) ||
      hasRemotePublicApiUrl();
    if (proxyOn) return apiRewriteRules;
    if (process.env.NODE_ENV === "development" && process.env.DISABLE_DEV_API_REWRITE !== "1") {
      return apiRewriteRules;
    }
    return [];
  },
  async headers() {
    const security = {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        { key: "X-DNS-Prefetch-Control", value: "on" },
      ],
    };
    const fontCache = {
      source: "/fonts/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    };
    // Never long-cache webpack chunks in dev: stale assets → `options.factory` / ReactCurrentDispatcher crashes after HMR.
    const nextStaticCache = {
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    };
    return process.env.NODE_ENV === "development"
      ? [security, fontCache]
      : [security, fontCache, nextStaticCache];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.in", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
};

// OpenNext dev hook can break `next dev` on some Windows + Node 22 setups (SWC / native binding errors).
// Enable only when you need Workers bindings in local dev: ENABLE_OPENNEXT_DEV=1
if (process.env.ENABLE_OPENNEXT_DEV === "1") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
