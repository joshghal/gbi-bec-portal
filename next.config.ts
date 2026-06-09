import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '.',
  },
  // Ensure the bundled poster fonts ship with the serverless function
  // that composites the catatan-khotbah cover.
  outputFileTracingIncludes: {
    '/api/updates/generate-poster': ['./src/lib/poster/fonts/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
