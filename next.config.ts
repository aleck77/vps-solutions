
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lowcode.artelegis.com.ua', 
        port: '',
        pathname: '/wp-content/uploads/**', 
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "http://localhost:3000",
        "http://localhost:9000", // Firebase Emulator UI
        "http://localhost:9002", // Firebase Studio main preview port
        "http://localhost:6006", // Storybook (if you use it)
        // Specific URLs from logs - ensure these match your current Firebase Studio URLs
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        // Broader wildcards that SHOULD cover Firebase Studio variants
        "https://*.cloudworkstations.dev", 
        "https://*.googleusercontent.com", 
    ],
  },
  // Webpack-specific configuration is removed to avoid conflict with Turbopack
};

export default nextConfig;
