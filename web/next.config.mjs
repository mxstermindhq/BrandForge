/**
 * API proxy:
 * - Production / Cloudflare / Vercel: set NEXT_PUBLIC_USE_API_PROXY=1 so the browser calls same-origin `/api/*` (no CORS).
 * - Set API_PROXY_DESTINATION=https://your-api.example.com (server-only env) as the rewrite target.
 * - Still set NEXT_PUBLIC_API_URL to that same API origin for OAuth callbacks (`getApiOrigin()`).
 * - Local dev: rewrites are ON by default so `/api/*` on the Next port forwards to Node (default :3000).
 */
const backendBase = String(
  process.env.API_PROXY_DESTINATION || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000",
).replace(/\/+$/, "");

const apiRewriteRules = [{ source: "/api/:path*", destination: `${backendBase}/api/:path*` }];

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    if (process.env.NEXT_PUBLIC_USE_API_PROXY === "1") return apiRewriteRules;
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

export default nextConfig;
