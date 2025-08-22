/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ★ 追加（AppServiceでは非常に重要）

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        maxAge: 1000 * 60 * 60,
      }
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**'],
        poll: 1000,
      }
    }
    return config
  },
}

module.exports = nextConfig
