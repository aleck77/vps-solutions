
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
        "http://localhost:9002", // Port used in IDX
        "https://*.cloudworkstations.dev", // Wildcard for Cloud Workstations
        "https://*.googleusercontent.com", // Also may be used for previews
        // Explicitly add the problematic origins from logs
        "https://9000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev",
        "https://6000-firebase-studio-1749175060262.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev"
    ],
  },
  // Webpack alias for @opentelemetry/exporter-jaeger should only be active for `next build`
  // For `next dev --turbopack`, it should not be present.
  // We can achieve this by checking the command.
  webpack: (config, { dev, isServer, nextRuntime, webpack }) => {
    // Check if the command is `next build` (dev is false, and it's not a dev server context)
    // Or more simply, apply it if not `dev` and `nextRuntime` is not 'edge'.
    // However, the simplest way to ensure it only applies for `next build` and not `next dev` with Turbopack
    // is to rely on the fact that Turbopack might ignore this section or that we can conditionally apply it.
    // For now, let's assume if `webpack` function is called, it's Webpack running (likely `next build`).
    // If Turbopack also calls this, we might need a more robust check.
    
    // The issue with @opentelemetry/exporter-jaeger is primarily a build-time issue (for production builds).
    // If it also causes issues with `next dev` without Turbopack, this alias is fine.
    // If `next dev --turbopack` fails with this, then we need a condition.
    // Given Turbopack was complaining about "Webpack is configured...", we might need this to be conditional.
    // Let's only apply it if `!dev` (i.e., during `next build`).
    if (!dev) {
        if (!config.resolve) {
          config.resolve = {};
        }
        if (!config.resolve.alias) {
          config.resolve.alias = {};
        }
        Object.assign(config.resolve.alias, {
            '@opentelemetry/exporter-jaeger': false,
        });
    }
    return config;
  },
};

export default nextConfig;
