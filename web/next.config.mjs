import path from "node:path";
import { fileURLToPath } from "node:url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * API proxy:
 * - Rewrites are baked in at `next build`. Cloudflare **Secrets** are often runtime-only — if API_PROXY_DESTINATION is
 *   secret-only, the build sees it empty and `/api/*` becomes 404. Setting NEXT_PUBLIC_API_URL to your real HTTPS API
 *   (plaintext build var) also enables rewrites and supplies the proxy target.
 * - Optional: API_PROXY_DESTINATION (same URL) when you want the rewrite target separate from the public URL.
 * - Local dev: rewrites stay on (forward to Node on :3000) unless DISABLE_DEV_API_REWRITE=1.
 */
function hasRemotePublicApiUrl() {
  const raw = String(process.env.NEXT_PUBLIC_API_URL || "")
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
  process.env.API_PROXY_DESTINATION || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000",
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
  async redirects() {
    return [
      { source: "/messages", destination: "/chat", permanent: true },
      { source: "/messages/:id", destination: "/chat/:id", permanent: true },
      { source: "/ai/copilot", destination: "/ai/chat", permanent: true },
      { source: "/ai/copilot/:path*", destination: "/ai/chat/:path*", permanent: true },
    ];
  },
  async rewrites() {
    const proxyOn =
      process.env.NEXT_PUBLIC_USE_API_PROXY === "1" ||
      Boolean(String(process.env.API_PROXY_DESTINATION || "").trim()) ||
      hasRemotePublicApiUrl();
    if (proxyOn) return apiRewriteRules;
    if (process.env.NODE_ENV === "development" && process.env.DISABLE_DEV_API_REWRITE !== "1") {
      return apiRewriteRules;
    }
    return [];
  },
  async headers() {
    return [
      {
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
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
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
