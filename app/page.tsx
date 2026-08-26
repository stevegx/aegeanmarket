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
    <div className="w-full flex flex-col items-center justify-start overflow-x-hidden bg-background">
      <section className="w-full mb-6">
        <MainPageCarousel />
      </section>

      <section className="w-full py-4 bg-muted border-y border-border">
        <InfoCarousel />
      </section>

      <section className="flex flex-col items-center py-20 px-4 w-full max-w-6xl mx-auto">
        <h3 className="text-sm md:text-md font-mono tracking-widest text-foreground/70 uppercase mb-3">
          The power of quality behind the name
        </h3>
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-foreground">
          Featured Partners
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
          <div className="relative w-48 h-32 md:w-64 md:h-40 rounded-xl bg-white p-6 shadow-sm ring-1 ring-border/50 transition-transform duration-300 hover:scale-105">
            <Image
              src={macallanLogo}
              alt="Macallan Logo"
              fill
              className="object-contain p-4 grayscale hover:grayscale-0 transition-all duration-500"
              priority
            />
          </div>
          <div className="relative w-48 h-32 md:w-64 md:h-40 rounded-xl bg-white p-6 shadow-sm ring-1 ring-border/50 transition-transform duration-300 hover:scale-105">
            <Image
              src={walkerLogo}
              alt="Johnny Walker Logo"
              fill
              className="object-contain rounded-md grayscale hover:grayscale-0 transition-all duration-500"
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

        <section className="w-full py-24 bg-muted/40 border-y border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-foreground">Our Stories</h2>
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
