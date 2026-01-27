import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  // Use webpack for konva compatibility
  webpack: (config, { isServer }) => {
    // Ignore canvas module (Node.js only, not needed for browser)
    // This prevents konva from trying to import the canvas package during build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;
