import { join } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: join(__dirname, "../"),
  turbopack: {
    root: join(__dirname, "../"),
  },
};

export default nextConfig;
