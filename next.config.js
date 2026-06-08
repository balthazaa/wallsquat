/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/wallsquat',
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
