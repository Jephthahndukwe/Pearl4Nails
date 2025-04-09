"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, CalendarPlus, Share } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function BookingSuccessPage() {
  const [calendarAdded, setCalendarAdded] = useState(false)

  // In a real app, this data would come from the booking process
  const bookingDetails = {
    service: "Nail Art & Extensions",
    date: "April 15, 2025",
    time: "2:00 PM",
    nailShape: "Almond",
    nailDesign: "Ombre",
    paymentStatus: "50% Deposit Paid",
  }

  const handleAddToCalendar = () => {
    // In a real app, this would integrate with calendar APIs
    setCalendarAdded(true)
    alert("Appointment added to your calendar!")
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: "My Pearl4nails Appointment",
        text: `I have an appointment at Pearl4nails on ${bookingDetails.date} at ${bookingDetails.time}`,
        url: window.location.href,
      })
    } else {
      alert("Sharing is not supported on this device")
    }
  }

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your appointment has been successfully booked.</p>
          </div>

          <div className="bg-pink-50 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-pink-500 mb-4 text-xl">Appointment Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p className="text-gray-600">Service:</p>
              <p className="font-medium">{bookingDetails.service}</p>

              <p className="text-gray-600">Date:</p>
              <p className="font-medium">{bookingDetails.date}</p>

              <p className="text-gray-600">Time:</p>
              <p className="font-medium">{bookingDetails.time}</p>

              <p className="text-gray-600">Nail Shape:</p>
              <p className="font-medium">{bookingDetails.nailShape}</p>

              <p className="text-gray-600">Nail Design:</p>
              <p className="font-medium">{bookingDetails.nailDesign}</p>

              <p className="text-gray-600">Payment Status:</p>
              <p className="font-medium text-green-600">{bookingDetails.paymentStatus}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600" onClick={handleAddToCalendar}>
                <CalendarPlus className="h-4 w-4" />
                {calendarAdded ? "Added to Calendar" : "Add to Calendar"}
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}>
                <Share className="h-4 w-4" />
                Share Appointment
              </Button>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  Return to Home
                </Link>
              </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="policy">
                <AccordionTrigger className="text-pink-500">Cancellation & Rescheduling Policy</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 mb-2">
                    You can cancel or reschedule your appointment up to 24 hours before the start time without any
                    penalty.
                  </p>
                  <p className="text-gray-600">
                    Cancellations made less than 24 hours before the appointment may result in forfeiture of your
                    deposit.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  )
}

