/** @type {import('next').NextConfig} */
const nextConfig = {
  // 新版不使用 /wallsquat 前缀，独立部署
  basePath: '',
  assetPrefix: undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
