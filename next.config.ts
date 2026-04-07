import type { NextConfig } from 'next'

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const basePath = isGitHubActions && repoName ? `/${repoName}` : ''

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  turbopack: {},
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'ui.shadcn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  ...(isGitHubActions
    ? {
        output: 'export',
        trailingSlash: true,
        basePath,
        assetPrefix: basePath ? `${basePath}/` : '',
      }
    : {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
              ],
            },
          ]
        },
        async redirects() {
          return []
        },
      }),
}

export default nextConfig
