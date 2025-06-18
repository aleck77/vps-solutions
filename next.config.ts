
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
        "http://localhost:9002", // Firebase Studio main preview
        "https://*.cloudworkstations.dev", // Wildcard for Cloud Workstations
        // Явные URL из логов для портов 9000 и 6000 (если они используются для HMR)
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        // Общий шаблон для Firebase Studio, покрывающий различные порты и префиксы
        "https://*.cluster-*.cloudworkstations.dev", 
        "https://*.googleusercontent.com", // Также может использоваться для превью
    ],
  },
  // Убрана Webpack-специфичная конфигурация, чтобы избежать конфликта с Turbopack
};

export default nextConfig;
    