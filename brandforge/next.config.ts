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
  },
};

export default nextConfig;
