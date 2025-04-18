"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/gallery" },
    { name: "Training", href: "/training" },
    { name: "Contact", href: "/contact" },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="lg:px-8 xs:px-2 flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="mt-2">
              <Image
                src="/images/Pearl4Nails_logo.png"
                alt="Pearl4nails"
                width={120}
                height={40}
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-pink-500"
                  : !scrolled && pathname === "/"
                    ? "text-gray-600 hover:text-pink-500"
                    : "text-gray-600 hover:text-pink-500"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className={`w-[60px] h-[60px] text-pink-500 ${!scrolled && pathname === "/" ? "text-pink-500" : ""}`} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 pt-[20%]">
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-lg font-medium ${
                        isActive(item.href) ? "text-pink-500" : "text-gray-600 hover:text-pink-500"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-4 w-full">
                  <Button
                    asChild
                    className={`w-full ${
                      !scrolled && pathname === "/"
                        ? "bg-pink-500 text-white hover:bg-pink-600"
                        : "bg-pink-500 hover:bg-pink-600 text-white"
                    }`}
                  >
                    <Link href="/booking" onClick={() => setIsOpen(false)}>Book Now</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <Button
              asChild
              className={`${
                !scrolled && pathname === "/"
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-pink-500 hover:bg-pink-600 text-white"
              }`}
            >
              <Link href="/booking">Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
