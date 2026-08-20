'use server'
import Image from 'next/image'
import ProductCarousel from '@/components/mainPageComponents/productCarousel'
import { MainPageCarousel } from '@/components/mainPageComponents/mainPageCarousel'
import { InfoCarousel } from '@/components/mainPageComponents/infoCarousel'
import getLatestProducts from './products/actions/getLatestProducts'
import getFeaturedProducts from './products/actions/getFeaturedProducts'
import BlogSection from '@/components/blogSection'
import walkerLogo from '@/public/images/walkerLogo.jpg'
import macallanLogo from '@/public/images/macallanLogo.png'

export default async function mainPage() {
  const [latestProducts, featuredProducts] = await Promise.all([
    getLatestProducts(10),
    getFeaturedProducts(10),
  ])

  return (
    <div className="w-full flex flex-col items-center justify-start overflow-x-hidden bg-white">
      <section className="w-full mb-6">
        <MainPageCarousel />
      </section>

      <section className="w-full py-4 bg-aegean-gray border-y border-border">
        <InfoCarousel />
      </section>

      <section className="flex flex-col items-center py-20 px-4 w-full max-w-6xl mx-auto">
        <h3 className="text-sm md:text-md font-mono tracking-widest text-aegean-dark/70 uppercase mb-3">
          The power of quality behind the name
        </h3>
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-aegean-dark">
          Featured Partners
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full opacity-80 hover:opacity-100 transition-opacity">
          <div className="relative w-48 h-32 md:w-64 md:h-40">
            <Image
              src={macallanLogo}
              alt="Macallan Logo"
              fill
              className="object-contain grayscale hover:grayscale-0 transition-all duration-500"
              priority
            />
          </div>
          <div className="relative w-48 h-32 md:w-64 md:h-40">
            <Image
              src={walkerLogo}
              alt="Johnny Walker Logo"
              fill
              className="object-contain grayscale hover:grayscale-0 transition-all duration-500"
              priority
            />
          </div>
        </div>
      </section>

      <div className="w-full flex flex-col gap-0">
        <section className="w-full py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel products={latestProducts} tittle="New Arrivals" />
          </div>
        </section>

        <section className="w-full py-24 bg-aegean-gray/10 border-y border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-aegean-dark">Our Stories</h2>
              <div className="h-1 w-20 bg-aegean-dark mx-auto mt-4" />
            </div>
            <BlogSection />
          </div>
        </section>

        {/* Section 3: Popular Choices - Επιστροφή στο λευκό */}
        <section className="w-full py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel
              products={featuredProducts}
              tittle="Popular Choices"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
