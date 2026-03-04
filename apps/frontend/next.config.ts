import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add alias for packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@packages': path.resolve(__dirname, '../../packages'),
    };
    return config;
  },
  // Turbopack config (Next.js 16+)
  turbopack: {
    resolveAlias: {
      '@packages': path.resolve(__dirname, '../../packages'),
    },
  },
};

export default nextConfig;
