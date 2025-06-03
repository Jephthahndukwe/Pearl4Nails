import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nail Art Studio - Pearl4nails",
  description:
    "Practice your nail art skills with our interactive nail design game. Create beautiful nail designs and bring them to life!",
}

export default function NailGameLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-gradient-to-b from-pink-50 to-white min-h-screen">
      {children}
    </div>
  )
}
