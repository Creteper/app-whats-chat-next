import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://cyberchat.vip/:path*',
      },
    ];
  },
};

export default nextConfig;