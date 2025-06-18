
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
        "http://localhost:9002", // Firebase Studio main preview port
        // Specific URLs from logs - ensure these match your current Firebase Studio URLs
        // The URL you provided in logs for CORS error:
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev", 
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev", // Often there's a 6000 port too
        // Broader wildcards that SHOULD cover Firebase Studio variants
        "https://*.cloudworkstations.dev", 
        "https://*.googleusercontent.com", 
    ],
  },
};

export default nextConfig;
