import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  ignoreDuringBuilds: true,
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
