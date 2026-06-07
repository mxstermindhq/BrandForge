import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Cloudflare bindings only apply to wrangler/opennext dev — not Vercel builds.
if (process.env.NODE_ENV === "development" && !process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare") as {
    initOpenNextCloudflareForDev: () => Promise<void>;
  };
  void initOpenNextCloudflareForDev();
}

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: false },
  // This is a sibling app inside the monorepo; pin tracing to this dir so Next
  // doesn't pick the parent lockfile as the workspace root.
  outputFileTracingRoot: here,
};

export default nextConfig;
