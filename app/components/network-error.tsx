"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"

export default function NetworkErrorPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false)

  useEffect(() => {
    document.title = "Network Error - Pearl4Nails"
  }, [])

  // Check network status using multiple methods
  const checkNetworkStatus = async () => {
    setIsCheckingNetwork(true)
    try {
      // Try to fetch a small resource
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors'
      })
      setIsOnline(true)
    } catch (error) {
      setIsOnline(false)
    } finally {
      setIsCheckingNetwork(false)
    }
  }

  // Initial check
  useEffect(() => {
    checkNetworkStatus()
    // Set up interval to check periodically
    const interval = setInterval(checkNetworkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      checkNetworkStatus()
      if (isOnline) {
        router.push(pathname)
      }
    }

    const handleOffline = () => {
      checkNetworkStatus()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [router, pathname, isOnline])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {isOnline ? "Network Error" : "Offline"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isOnline ? "Unable to connect to the server" : "You're currently offline"}
          </p>
        </div>
        <p className="text-muted-foreground">
          {isOnline ? 
            "Please check your internet connection and try again." : 
            "Your device is not connected to the internet."
          }
        </p>
        {isCheckingNetwork && (
          <p className="text-sm text-muted-foreground">
            Checking network connection...
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push("/")}>Go Home</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
