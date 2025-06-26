"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  const router = useRouter()

  useEffect(() => {
    document.title = "Page Not Found - Pearl4Nails"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <video
            src="/videos/404.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-pink-500">404</h1>
          <p className="text-xl text-muted-foreground">Page Not Found</p>
        </div>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back home
        </Button>
      </div>
    </div>
  )
}
