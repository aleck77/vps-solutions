
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
    // Keeping allowedDevelopmentOrigins commented out as it might not be the primary issue
    // and can cause "Unrecognized key(s)" if not configured correctly for the specific Next.js version/environment.
    // We can revisit if CORS or WebSocket errors become primary blockers after auth is fixed.
    // allowedDevelopmentOrigins: ["http://localhost:9002", "https://*.cloudworkstations.dev"],
  },
};

export default nextConfig;
