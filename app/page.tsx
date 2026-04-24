import { Button } from '@/components/ui/button'
import Link from 'next/link'
import walkerLogo from '@/public/images/walkerLogo.jpg'
import macallanLogo from '@/public/images/macallanLogo.png'
import Image from 'next/image'

import { MainPageCarousel } from '@/components/mainPageComponents/mainPageCarousel'
import React from 'react'
import { InfoCarousel } from '@/components/mainPageComponents/infoCarousel'
export default function mainPage() {
  return (
    <div className="w-full  flex flex-col items-center justify-start py-10 overflow-x-hidden bg-aegean-gray/50">
      <div className="flex items-center justify-center w-full mb-10 px-4">
        <MainPageCarousel />
      </div>
      <InfoCarousel />
      <div className="flex flex-col items-center mt-10 px-4 w-full max-w-6xl">
        <h3 className="text-xl font-mono text-aegean-dark mb-3">
          The power of quality behind the name
        </h3>
        <h2 className="text-2xl md:text-4xl  font-bold mb-8 text-center">
          Special Brands
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 w-full">
          <div className="relative w-64 h-48 md:w-200 md:h-100">
            <Image
              src={macallanLogo}
              alt="Macallan Logo"
              fill
              className="object-contain bg-white"
              priority
            />
          </div>
          <div className="relative w-64 h-48 md:w-200 md:h-100">
            <Image
              src={walkerLogo}
              alt="Johnny Walker Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
