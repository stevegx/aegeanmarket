import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'grigoriouonline.gr',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
