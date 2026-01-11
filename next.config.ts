import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Empty config to satisfy Next.js 16 requirement
  },
  async headers() {
    return [
      {
        // Apply headers to all routes for FFmpeg.wasm SharedArrayBuffer support
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
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
