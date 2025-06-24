/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove Pages Router specific options
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Disable experimental features
  experimental: {
    // Disable experimental features for better compatibility
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
  },
  // Add polyfills for better browser compatibility
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig

// This is a standard Next.js configuration file using ES Module syntax
// It includes common configurations for TypeScript, image optimization, and webpack settings
