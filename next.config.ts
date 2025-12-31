import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
