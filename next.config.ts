import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // 必须指定协议（http 或 https）
        hostname: "cyberchat.vip", // 域名部分
        port: "", // 端口（没有则留空）
        pathname: "/**", // 允许该域名下的所有路径
      },
    ],
    // 允许未优化的图片（支持查询字符串）
    unoptimized: true,
  },
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://cyberchat.vip/:path*",
      },
    ];
  },
};

export default nextConfig;
