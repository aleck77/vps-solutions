
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
  // The 'allowedDevelopmentOrigins' key is completely removed for now
  // to address the "Unrecognized key(s)" error.
  // If CORS errors appear in the browser after this, it means the setting
  // is needed but Next.js/Turbopack isn't recognizing the key in this environment.
  // For Next.js 14.0.4+ and 15+, allowedDevelopmentOrigins is a top-level property
  // experimental: {
  //   // serverActions: true, // serverActions is often enabled by default or configured at the root.
  // },
};

export default nextConfig;
