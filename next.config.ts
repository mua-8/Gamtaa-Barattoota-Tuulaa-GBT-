import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the sandboxed live-preview proxy hosts, public tunnel hosts,
  // and local network devices (phones on the same WiFi) to load dev resources.
  allowedDevOrigins: [
    "*.e2b.app",
    "*.trycloudflare.com",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ercldullaqhoiotwllfb.supabase.co',
      },
    ],
  },
};

export default nextConfig;
