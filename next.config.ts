import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2678400, // 31 days — product photos are static once imported
    // Next 16 defaults images.qualities to [75]; the product-detail hero uses
    // quality={85} deliberately for the large image.
    qualities: [75, 85],
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
