
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Ensures all necessary files are copied for a minimal Docker image
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    // Разрешаем источники для HMR в среде IDX (Firebase Studio / Cloud Workstations)
    // Добавляем как wildcard, так и специфичные порты/домены, которые могут использоваться
    allowedDevOrigins: [ // Исправлено с allowedDevelopmentOrigins
        "http://localhost:3000", // Стандартный Next.js порт
        "http://localhost:9002", // Порт, который мы используем в IDX
        "https://*.cloudworkstations.dev", // Wildcard для Cloud Workstations
        "https://*.googleusercontent.com", // Также может использоваться для превью
        // Можно добавить и более конкретные, если они известны и стабильны:
        // "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        // "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
