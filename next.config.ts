import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Use the recommended way to handle dynamic components by making sure they're generated at request time
  output: 'standalone',
};

export default nextConfig;
