"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, CalendarPlus, Share2, ExternalLink, MapPin, Mail, Phone, Clock, Info, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CalendarEvent } from "@/types/calendar"
import { addEventToCalendar } from "@/lib/calendar"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function BookingSuccessPage() {
  const [isSharing, setIsSharing] = useState(false)
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  // Get booking details from URL parameters
  const bookingDetails = {
    service: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('service') : undefined,
    date: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('date') : undefined,
    time: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('time') : undefined,
    nailShape: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('nailShape') : undefined,
    nailDesign: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('nailDesign') : undefined,
    tattooLocation: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tattooLocation') : undefined,
    tattooSize: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tattooSize') : undefined,
    referenceImage: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('referenceImage') : undefined,
    customer: {
      name: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('customer.name') : undefined,
      email: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('customer.email') : undefined,
      phone: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('customer.phone') : undefined,
      notes: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('customer.notes') : undefined
    },
    location: "15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria",
    contact: {
      email: "nwabuezemercy2@gmail.com",
      phone: "+234 916 076 3206"
    },
    preparation: [
      "Please arrive 15 minutes early for your appointment",
      "Avoid wearing nail polish on the day of your appointment",
      "Bring any reference images you would like to show",
      "Feel free to bring your own nail art inspiration"
    ]
  }

  // Redirect if user tries to access success page without booking
  useEffect(() => {
    if (!bookingDetails.service || !bookingDetails.date || !bookingDetails.time) {
      toast.error("Please book an appointment first")
      setTimeout(() => {
        window.location.href = '/booking'
      }, 1000)
    }
  }, [])

  const handleAddToCalendar = async () => {
    setIsAddingToCalendar(true)
    try {
      const event: CalendarEvent = {
        title: `Pearl4Nails - ${bookingDetails.service}`,
        description: `Service: ${bookingDetails.service}\nLocation: ${bookingDetails.location}\nContact: ${bookingDetails.contact.email}`,
        start: new Date(`${bookingDetails.date} ${bookingDetails.time}`),
        end: new Date(new Date(`${bookingDetails.date} ${bookingDetails.time}`).getTime() + 90 * 60000) // 90 minutes duration
      }

      const result = await addEventToCalendar(event)
      if (result) {
        toast.success("Appointment added to calendar!")
      } else {
        toast.error("Failed to add appointment to calendar")
      }
    } catch (error) {
      console.error('Error adding to calendar:', error)
      toast.error("Failed to add appointment to calendar")
    } finally {
      setIsAddingToCalendar(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const text = `I have an appointment at Pearl4Nails!\n\nService: ${bookingDetails.service}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nLocation: ${bookingDetails.location}\n\nLooking forward to it! 🎉`
      
      if (navigator.share) {
        await navigator.share({
          title: "My Pearl4Nails Appointment",
          text: text,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(text).then(() => {
          toast.success("Appointment details copied to clipboard!")
        }).catch((err) => {
          console.error('Failed to copy:', err)
          toast.error("Failed to copy appointment details")
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error("Failed to share appointment")
    } finally {
      setIsSharing(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    setIsCancelling(true)
    try {
      // In a real app, you would make an API call to cancel the appointment
      // For now, we'll just show a success message
      
      // Redirect to cancelled page after a short delay
      setTimeout(() => {
        window.location.href = '/booking/cancelled'
      }, 1000)
    } catch (error) {
      console.error('Error cancelling:', error)
      toast.error("Failed to cancel appointment")
    } finally {
      setIsCancelling(false)
      setIsCancelModalOpen(false)
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
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600"
                onClick={handleAddToCalendar}
                disabled={isAddingToCalendar}
              >
                <CalendarPlus className="h-4 w-4" />
                {isAddingToCalendar ? 'Adding to Calendar...' : 'Add to Calendar'}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share2 className="h-4 w-4" />
                {isSharing ? 'Sharing...' : 'Share Appointment'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isCancelling}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  Return to Home
                </Link>
              </Button>
            </div>

            <div className="space-y-6 mt-8">
              <div className="bg-yellow-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-yellow-600 mb-4">Important: Deposit Payment</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    A 50% deposit is required to confirm your appointment. Please make the payment within 24 hours of
                    booking.
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm">Account Name: <span className='font-bold'>Mercy Ezinne Nwabueze</span></p>
                      <p className="text-sm">Account Number: <span className='font-bold'>9160763206</span></p>
                      <p className="text-sm">Bank: <span className='font-bold'>Opay Digital Service Limited</span></p>
                      <p className="text-sm">Reference: <span className='font-bold'>Your Name + Appointment Date</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-600">
                    Please include your name and appointment date in the payment reference.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-500" />
                  Location
                </h3>
                <p className="text-gray-600">{bookingDetails.location}</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-pink-500" />
                  Preparation Tips
                </h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  {bookingDetails.preparation.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
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

                <AccordionItem value="deposit">
                  <AccordionTrigger className="text-pink-500">Why is a 50% Deposit Required?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        We require a 50% deposit to confirm your appointment for several important reasons:
                      </p>
                      <ul className="list-disc pl-5 text-gray-600 space-y-2">
                        <li>
                          <strong>Resource Allocation:</strong> Your deposit helps us allocate our time and resources
                          specifically for your appointment, ensuring we can provide you with the best possible service.
                        </li>
                        <li>
                          <strong>Commitment:</strong> The deposit serves as a commitment to your appointment, helping us
                          maintain a reliable schedule for all our clients.
                        </li>
                        <li>
                          <strong>Preparation:</strong> Your deposit allows us to prepare for your specific service,
                          including gathering materials and setting aside the necessary time.
                        </li>
                        <li>
                          <strong>Professionalism:</strong> The deposit policy is a standard practice in the beauty
                          industry, ensuring both you and we are committed to the appointment.
                        </li>
                      </ul>
                      <p className="text-gray-600">
                        The remaining 50% of the payment will be due on the day of your appointment. Your deposit will be
                        applied towards the total cost.
                      </p>
                      <p className="text-gray-600">
                        For more information about payment details and how to make your deposit, please see the <Link href="#" className="text-pink-500 hover:text-pink-600">Deposit Payment</Link> section at
                        the top of this page.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq">
                  <AccordionTrigger className="text-pink-500">Appointment FAQs</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900">What should I bring?</h4>
                        <p className="text-gray-600 mt-1">
                          Please bring any nail art inspiration images you have and wear comfortable clothing.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">What happens if I'm late?</h4>
                        <p className="text-gray-600 mt-1">
                          If you're more than 15 minutes late, your appointment may need to be rescheduled.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Can I bring someone with me?</h4>
                        <p className="text-gray-600 mt-1">
                          Yes, but please let us know in advance if you plan to bring someone. This helps us ensure we have
                          enough space and can maintain a comfortable environment for all our clients.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">What about the deposit?</h4>
                        <p className="text-gray-600 mt-1">
                          A 50% deposit is required to confirm your appointment. Please make the payment within 24 hours of
                          booking. The deposit is non-refundable if you cancel less than 24 hours before your appointment.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contact">
                  <AccordionTrigger className="text-pink-500">Contact Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-pink-500" />
                        <p className="text-gray-600">{bookingDetails.contact.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-pink-500" />
                        <p className="text-gray-600">{bookingDetails.contact.phone}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <AlertDialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your appointment? Please note that if you cancel less than 24 hours before your appointment, you may forfeit your deposit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
