import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from any domain for demo site
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Expose tracker URL to all pages
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
};

export default nextConfig;
