'use client'

import * as React from 'react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

interface InfoCarouselItems {
  title: string
  icon: React.ReactNode
}

export function InfoCarousel() {
  const plugin = React.useRef(
    AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: false })
  )

  const items: InfoCarouselItems[] = [
    {
      title: 'We offer the best prices on the market',
      icon: <PriceDownIcon size={40} />,
    },
    { title: 'Support 24/7', icon: <SupportIcon size={40} /> },
    { title: 'Safe payments', icon: <SafePaymentsIcon size={40} /> },
    {
      title: 'Free delivery for orders over €50',
      icon: <DeliveryTrackIcon size={40} />,
    },
    {
      title: 'We offer the best prices on the market',
      icon: <PriceDownIcon size={40} />,
    },
    { title: 'Support 24/7', icon: <SupportIcon size={40} /> },
    { title: 'Safe payments', icon: <SafePaymentsIcon size={40} /> },
    {
      title: 'Free delivery for orders over €50',
      icon: <DeliveryTrackIcon size={40} />,
    },
  ]

  return (
    <div className="w-screen h-12 bg-background/80 border-y border-border overflow-hidden flex items-center">
      <Carousel
        opts={{
          loop: true,
          align: 'start',
          dragFree: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {items.map((item, index) => (
            <CarouselItem key={index} className="pl-0 md:basis-1/2">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="flex flex-row items-center justify-center gap-3 p-1 h-10">
                  <div className="text-foreground shrink-0">{item.icon}</div>
                  <h3 className="text-xs md:text-sm font-medium leading-tight whitespace-nowrap">
                    {item.title}
                  </h3>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

const PriceDownIcon = ({ size = 100, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Κύκλος φόντου */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />

      {/* Βέλος προς τα κάτω */}
      <path
        d="M12 17V7M12 17L8 13M12 17L16 13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Σύμβολο Ευρώ */}
      <text
        x="12"
        y="13"
        fontSize="5"
        fontWeight="bold"
        fill={color}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
      >
        €
      </text>
    </svg>
  )
}

const SupportIcon = ({ size = 100, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Εξωτερικός Κύκλος */}
      <circle cx="12" cy="12" r="10" />

      {/* Ακουστικά */}
      <path d="M16 11V10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10V11" />

      {/* Αριστερό και δεξί μέρος ακουστικών */}
      <rect x="7" y="11" width="2" height="3" rx="1" />
      <rect x="15" y="11" width="2" height="3" rx="1" />

      {/* Μικρόφωνο */}
      <path d="M16 14C16 15.5 15 17 13 17H12" />
    </svg>
  )
}

const SafePaymentsIcon = ({ size = 100, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ασπίδα */}
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />

      {/* Λουκέτο */}
      <rect x="9" y="11" width="6" height="4" rx="1" />
      <path d="M10 11V9C10 7.9 10.9 7 12 7C13.1 7 14 7.9 14 9V11" />

      {/* Σύμβολο Ευρώ (μικρό, κάτω από το λουκέτο) */}
      <path
        d="M13.5 17.5H11.5M13.5 18.5H11.5M14 16.5C14 16.5 11 16.5 11 18C11 19.5 14 19.5 14 19.5"
        strokeWidth="1.2"
      />
    </svg>
  )
}
const DeliveryTrackIcon = ({
  size = 100,
  color = '#3E85B5',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Το σώμα του φορτηγού */}
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />

      {/* Ρόδες */}
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />

      {/* Γραμμές ταχύτητας/κίνησης πίσω από το φορτηγό */}
      <line x1="1" y1="9" x2="5" y2="9" />
      <line x1="1" y1="13" x2="4" y2="13" />
    </svg>
  )
}
