"use client"

import { Check, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BookingCancelledPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex items-center justify-center">
          <Check className="h-20 w-20 text-green-500" />
        </div>

        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Appointment Cancelled</h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully cancelled. If you need to book another appointment, you can do so at
            any time.
          </p>

          <div className="bg-yellow-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Important Notice</h3>
            </div>
            <p className="text-gray-600">
              Please note that if you cancelled less than 24 hours before your appointment, you may forfeit your deposit.
              For more information about our cancellation policy, please visit our booking page.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/booking">Book Another Appointment</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
