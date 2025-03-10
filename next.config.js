/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true
  },
  // Production optimizations
  output: 'standalone',
  productionBrowserSourceMaps: false,
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp'],
  },

  // Enable server actions
  experimental: {
    serverActions: {
      enabled: true
    }
  },

  // Vercel specific optimizations
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
  },

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
