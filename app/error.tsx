"use client"

import { Button } from "@/components/ui/button"
import NetworkErrorPage from "./components/network-error"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log the error to an error reporting service
  console.error(error)

  // Check if this is a network error
  const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('Network Error')

  return isNetworkError ? (
    <NetworkErrorPage />
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
