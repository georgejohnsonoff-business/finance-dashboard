import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Google Sheets API requires server-side only — keep credentials safe
  serverExternalPackages: ['googleapis'],
};

export default nextConfig;
