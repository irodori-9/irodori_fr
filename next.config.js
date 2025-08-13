const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  },
  
  // Webpack キャッシュエラー対策
  webpack: (config, { dev }) => {
    if (dev) {
      // 開発環境でのキャッシュ設定を最適化
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // 並行書き込み制限でエラーを防止
        maxAge: 1000 * 60 * 60, // 1時間
      }
      
      // ファイル監視の最適化
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**'],
        poll: 1000,
      }
    }
    return config
  },
}

module.exports = withPWA(nextConfig)