/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，适配 Cloudflare Pages
  output: 'export',
  basePath: '',
  assetPrefix: '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out',
};

module.exports = nextConfig;
