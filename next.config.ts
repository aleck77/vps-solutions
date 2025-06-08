
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
    ],
  },
  experimental: {
    // serverActions: true, // serverActions is often enabled by default or configured at the root.
  },
  // For Next.js 14.0.4+ and 15+, allowedDevelopmentOrigins is a top-level property
  allowedDevelopmentOrigins: [
    'https://*.googleusercontent.com',
    'https://*.cloud.google.com',
    'https://*.cloud.goog',
    'https://*.firebaseapp.com',
    'https://*.firebaseio.com',
    // The port the dev server actually runs on (from npm run dev output)
    'https://9002-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev',
    'http://localhost:9002',
    // Additional ports seen in errors or mentioned by user
    'https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev',
    'http://localhost:9000',
    'https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev',
    'http://localhost:6000',
  ],
};

export default nextConfig;
