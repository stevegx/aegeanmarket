import Logo from '../public/images/aegeanMarketLogo.jpg'
import Image from 'next/image'
import Link from 'next/link'
export default function Footer() {
  return (
    <div className="flex flex-col bg-aegean-dark text-white w-full h-auto p-4 pt-10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-4 w-full text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Image
              src={Logo}
              alt="Aegean Market Logo"
              width={400}
              height={400}
              className="h-20 w-auto rounded-lg object-contain"
              loading="lazy"
            />
            <h4 className="text-sm max-w-xs pt-4 font-light">
              Our e-shop offers you easy, fast and reliable purchase of products
              for your everyday or your special occasion.
            </h4>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg pb-2">Store</h3>
            <Link
              href="/aboutus"
              className="font-extralight pt-2 hover:text-aegean-green cursor-pointer"
            >
              About us
            </Link>
            <Link
              href="/products"
              className="font-extralight pt-2 hover:text-aegean-green cursor-pointer"
            >
              Store
            </Link>
            <Link
              href="/blog"
              className="font-extralight pt-2 hover:text-aegean-green cursor-pointer"
            >
              Blog
            </Link>
            <Link
              href="/communication"
              className="font-extralight pt-2 hover:text-aegean-green cursor-pointer"
            >
              Communication
            </Link>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg pb-2">Useful Information</h3>
            <h4 className="font-extralight pt-2 hover:text-aegean-green cursor-pointer">
              My account
            </h4>
            <h4 className="font-extralight pt-2 hover:text-aegean-green cursor-pointer">
              Payment Methods
            </h4>
            <h4 className="font-extralight pt-2 hover:text-aegean-green cursor-pointer">
              Shipments
            </h4>
            <h4 className="font-extralight pt-2 hover:text-aegean-green cursor-pointer">
              Returns/Cancelations
            </h4>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg pb-2">Contact</h3>
            <h4 className="font-extralight pt-2 hover:text-aegean-green">
              Telephone: +3069505939532959
            </h4>
            <h4 className="font-extralight pt-2 hover:text-aegean-green">
              Email: stevevetsikas85@gmail.com
            </h4>
            <h4 className="font-extralight pt-2 hover:text-aegean-green">
              Location: Mytilene, Greece
            </h4>
            <h4 className="font-extralight pt-2 hover:text-aegean-green">
              Hours: Mon-Sunday: 24/7
            </h4>
          </div>
        </div>

        <hr className="border-t border-gray-50/20 my-8 w-full" />

        <div className="flex justify-center md:justify-start w-full">
          <h2 className="text-xs md:text-sm font-semibold opacity-80">
            © Created by Stauros Vetsikas @2026
          </h2>
        </div>
      </div>
    </div>
  )
}
