import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "whiteskyhosting.com" },
      { protocol: "https", hostname: "drain.cx" },
      { protocol: "https", hostname: "dyotravel.com" },
      { protocol: "https", hostname: "boostingfactory.com" },
      { protocol: "https", hostname: "fluorite.store" },
      { protocol: "https", hostname: "passle.vercel.app" },
      { protocol: "https", hostname: "repsheets.net" },
      { protocol: "https", hostname: "lava.pw" },
      { protocol: "https", hostname: "cascade.markets" },
    ],
  },
};

export default nextConfig;
