import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // recharts ships browser-only APIs; transpile via Next to avoid ESM/CJS
  // mismatch errors during build.
  transpilePackages: ['recharts'],
  // Pin the workspace root so Turbopack does not silently pick up a stray
  // lockfile from a parent directory during local development or CI.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
