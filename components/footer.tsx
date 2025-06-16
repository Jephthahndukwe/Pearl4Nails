import Link from "next/link"
import Image from "next/image"
import SocialLinks from "@/components/social-links"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="inline-block ">
              <div className="">
                <Image
                  src="/images/Pearl4Nails_logo.png"
                  alt="Pearl4nails"
                  width={140}
                  height={50}
                  className="object-contain brightness-0 invert"
                  unoptimized
                />
              </div>
            </Link>
            <p className="text-gray-400 mb-6">
              Premium nail care and beauty services with 100% satisfaction guaranteed.
            </p>
            <SocialLinks />
          </div>

          <div>
            <h3 className="font-bold text-pink-400 mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-pink-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/training" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Training
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-pink-400 mb-6 text-lg">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Nails
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Lash Extensions
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Microblading
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Makeup
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Manicure & Pedicure
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Piercing
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Tooth Gems
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Brow Trimming
                </Link>
              </li>
              {/* <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Hair Revamping
                </Link>
              </li> */}
              {/* <li>
                <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Tattoo
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-pink-400 mb-6 text-lg">Socials</h3>
            <div className="text-gray-400">
              <p>WhatsApp: 09160763206</p>
              <p>Instagram: @pearl4nails</p>
              <p>TikTok: pearl_4_nails</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center">
          <p className="text-gray-400">&copy; {currentYear} Pearl4nails. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
