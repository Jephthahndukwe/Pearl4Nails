import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import FloatingWhatsApp from "@/components/floating-whatsapp"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Pearl4nails - Premium Nail & Beauty Services",
    description:
    "Get 100% satisfaction with our premium nail care, lash extensions, microblading, makeup, and more beauty services.",
    keywords: [
    "nail care",
    "nail art",
    "nail extensions",
    "lash extensions",
    "brow embroidery",
    "brow shaping",
    "microblading",
    "manicure and pedicure",
    "makeup",
    "manicure",
    "pedicure",
    "beauty", 
    "beauty salon",
    "beauty services",
    "tooth gems",
    "tooth gem",
    "premium tooth gems",
    "premium tooth gem",
    "premium nail care",
    "premium lash extensions",
    "premium microblading",
    "premium makeup",
    "premium manicure",
    "premium pedicure",
    "premium nail extensions",
    "premium nail art",
    "premium lash extensions",
    "premium microblading",
    "premium makeup",
    "premium beauty services"
  ],
  icons: {
    icon: '/Pearl4nails-logo.png',
    apple: '/Pearl4nails-logo.png',
    shortcut: '/Pearl4nails-logo.png'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow">{children}</div>
            <Footer />
            <FloatingWhatsApp />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

import "./globals.css"
