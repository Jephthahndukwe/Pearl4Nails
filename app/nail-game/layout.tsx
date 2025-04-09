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
  return <>{children}</>
}

