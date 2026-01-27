import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  // Use webpack for React resolution with react-konva
  // This ensures React is resolved as a singleton to avoid version conflicts
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
      };
    }
    return config;
  },
};

export default nextConfig;
