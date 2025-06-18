
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
        "http://localhost:3000", // Standard Next.js port
        "http://localhost:9002", // Port used in IDX / Firebase Studio
        "https://*.cloudworkstations.dev", // Wildcard for Cloud Workstations
        "https://*.googleusercontent.com", // Also may be used for previews
        // Explicitly add the problematic origins from logs
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev"
    ],
  },
  // УБРАНА ЛЮБАЯ WEBPACK-СПЕЦИФИЧНАЯ КОНФИГУРАЦИЯ, ЕСЛИ ОНА БЫЛА ЗДЕСЬ В "ХОРОШЕМ" КОММИТЕ
};

export default nextConfig;
