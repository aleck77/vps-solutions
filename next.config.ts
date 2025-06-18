
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
        "http://localhost:3000", // Common local dev
        "http://localhost:9002", // Firebase Studio main preview (from your logs)
        // Specific URLs from logs - ensure these match your current Firebase Studio URLs
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        // Broader wildcards for Firebase Studio
        "https://*.cloudworkstations.dev", 
        "https://*.googleusercontent.com", 
        // Add any other specific origins if HMR errors persist for them
    ],
  },
  // Webpack-specific configuration is removed to avoid conflict with Turbopack
};

export default nextConfig;
    
