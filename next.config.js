const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: '**.myqcloud.com',
      },
    ],
  },
  // 排除 Cherry Markdown 在服务端的打包
  experimental: {
    serverComponentsExternalPackages: ['cherry-markdown', 'echarts'],
  },
  // 确保 transpilePackages 正确配置
  transpilePackages: ['@radix-ui/react-avatar'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 在服务端构建时排除 Cherry Markdown
      config.externals = [...(config.externals || []), 'cherry-markdown', 'echarts']
    }
    return config
  },
}

module.exports = withNextIntl(nextConfig)
