
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
        "http://localhost:3000", // General local dev
        "http://localhost:9002", // Port used in IDX / Firebase Studio for main preview
        "https://*.cloudworkstations.dev", // Wildcard for Cloud Workstations
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev", // Explicit URL from logs for port 9000
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev", // Explicit URL for port 6000
        "https://*.googleusercontent.com", // Also may be used for previews
    ],
  },
  // Webpack-specific configuration removed to avoid conflict with Turbopack
};

export default nextConfig;
    
