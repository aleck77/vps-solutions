
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
        "https://*.cloudworkstations.dev", // Wildcard for Cloud Workstations (should cover the specific one)
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev", // Explicitly added
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev", // Explicitly added for other potential ports
        "https://*.googleusercontent.com", // Also may be used for previews
    ],
  },
  // УБЕДИТЬСЯ, ЧТО НЕТ НИКАКОЙ WEBPACK-СПЕЦИФИЧНОЙ КОНФИГУРАЦИИ
  // Если Webpack-конфиг был здесь для решения проблемы с @opentelemetry/exporter-jaeger,
  // он был удален, так как конфликтовал с Turbopack.
  // Проблема с @opentelemetry/exporter-jaeger будет решаться при необходимости во время 'npm run build'.
};

export default nextConfig;
