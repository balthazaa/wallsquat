/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/wallsquat' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/wallsquat' : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
