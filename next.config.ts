import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mobile app (Capacitor) requires static export.
  // Full-stack (Vercel/Local) requires SSR/API.
  output: process.env.IS_MOBILE_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: '.',
  },
  webpack: (config) => {
    // Fix for handling video files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
