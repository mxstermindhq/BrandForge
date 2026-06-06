import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
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
