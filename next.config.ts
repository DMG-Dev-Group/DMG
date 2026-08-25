import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Pin the workspace root to this project. The parent home directory contains a
// stray lockfile, so Next would otherwise infer the wrong root for file tracing.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
