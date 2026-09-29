const createNextIntlPlugin = require('next-intl/plugin')
const webpack = require('webpack')

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 隔离开发服务与生产构建产物，避免并行运行时相互覆盖 vendor chunks。
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  typescript: {
    // Keep tests and local work artifacts out of the production type-check worker.
    tsconfigPath: 'tsconfig.build.json',
  },
  // Docker 独立部署模式
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
    // A custom webpack() disables this memory optimization by default in Next 14.
    // Release each compiler process before starting the type-check worker.
    webpackBuildWorker: true,
    cpus: 1,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
    serverComponentsExternalPackages: ['cherry-markdown', 'echarts'],
  },
  // 确保 transpilePackages 正确配置
  transpilePackages: ['@radix-ui/react-avatar'],
  webpack: (config, { isServer }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(false),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      })
    )

    if (isServer) {
      // 在服务端构建时排除 Cherry Markdown
      config.externals = [...(config.externals || []), 'cherry-markdown', 'echarts']
    }
    return config
  },
}

module.exports = withNextIntl(nextConfig)
