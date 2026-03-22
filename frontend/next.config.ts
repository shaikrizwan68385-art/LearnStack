import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
