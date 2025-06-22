
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
    // This is often needed for the dev server in containerized/proxied environments like Studio
    allowedDevOrigins: [
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
