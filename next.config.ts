import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ekava.gr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ekava.gr',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
