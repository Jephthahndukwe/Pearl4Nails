"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, CalendarPlus, Share2, ExternalLink, MapPin, Mail, Phone, Clock, Info, AlertCircle, Trash2, Loader2 } from "lucide-react"
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
import { useRouter } from 'next/navigation';

interface BookingDetails {
  service: string;
  serviceType?: string;
  serviceName?: string;
  serviceTypeName?: string;
  servicePrice?: string;
  serviceDuration?: string;
  date: string;
  time: string;
  nailShape?: string | null;
  nailDesign?: string | null;
  tattooLocation?: string | null;
  tattooSize?: string | null;
  referenceImage?: string | null;
  location: string;
  contact: {
    email: string;
    phone: string;
  };
  preparation: string[];
  appointmentId: string;
}

export default function BookingSuccessPage() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const service = searchParams.get('service');
      const status = searchParams.get('status');
      
      // If appointment is cancelled, redirect to cancelled page
      if (status === 'cancelled') {
        router.push('/booking/cancelled');
        return;
      }

      const preparation = service === 'nails' 
        ? [
            "Please arrive 15 minutes early for your appointment",
            "Make sure your nails are clean and dry",
            "Avoid wearing nail polish if you have natural nails",
            "Bring any reference images you would like to show"
          ]
        : service === 'tattoo'
        ? [
            "Please arrive 15 minutes early for your appointment",
            "Make sure the area is clean and shaved if necessary",
            "Avoid wearing tight clothing over the tattoo area",
            "Bring any reference images you would like to show"
          ]
        : [
            "Please arrive 15 minutes early for your appointment",
            "Make sure you're comfortable with the service",
            "Feel free to bring any reference images you would like to show"
          ];

      const details: BookingDetails = {
        service: searchParams.get('service') || 'Service',
        serviceType: searchParams.get('serviceType') || undefined,
        serviceName: searchParams.get('serviceName') || undefined,
        serviceTypeName: searchParams.get('serviceTypeName') || undefined,
        servicePrice: searchParams.get('servicePrice') || undefined,
        serviceDuration: searchParams.get('serviceDuration') || undefined,
        date: searchParams.get('date') || 'Date',
        time: searchParams.get('time') || 'Time',
        nailShape: searchParams.get('nailShape'),
        nailDesign: searchParams.get('nailDesign'),
        tattooLocation: searchParams.get('tattooLocation'),
        tattooSize: searchParams.get('tattooSize'),
        referenceImage: searchParams.get('referenceImage'),
        location: "15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria",
        contact: {
          email: "pearl4nails@gmail.com",
          phone: "09160763206"
        },
        preparation,
        appointmentId: searchParams.get('appointmentId') || 'AP123456'
      };

      // Set booking details to state
      setBookingDetails(details);
      
      // Log for debugging - no sensitive info
      console.log("Appointment details loaded", {
        service: details.service,
        date: details.date,
        time: details.time,
        appointmentId: details.appointmentId
      });

      // Redirect if user tries to access success page without booking
      if (!details.service || !details.date || !details.time || !details.appointmentId) {
        router.push('/booking');
      }
    }
  }, [router]);

  if (!bookingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <p className="text-gray-600">Loading your appointment details...</p>
        </div>
      </div>
    );
  }

  const handleAddToCalendar = async () => {
    setIsAddingToCalendar(true)
    try {
      const event: CalendarEvent = {
        title: `Pearl4Nails - ${bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service}`,
        description: `Service: ${bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service}${bookingDetails.servicePrice ? `\nPrice: ${bookingDetails.servicePrice}` : ''}${bookingDetails.serviceDuration ? `\nDuration: ${bookingDetails.serviceDuration}` : ''}\nLocation: ${bookingDetails.location}\nContact: ${bookingDetails.contact.email}`,
        start: new Date(`${bookingDetails.date} ${bookingDetails.time}`),
        end: new Date(new Date(`${bookingDetails.date} ${bookingDetails.time}`).getTime() + (bookingDetails.serviceDuration ? parseInt(bookingDetails.serviceDuration) : 90) * 60000) // Use service duration or default to 90 minutes
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
      const text = `I have an appointment at Pearl4Nails!\n\nService: ${bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service}${bookingDetails.servicePrice ? `\nPrice: ${bookingDetails.servicePrice}` : ''}${bookingDetails.serviceDuration ? `\nDuration: ${bookingDetails.serviceDuration}` : ''}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nLocation: ${bookingDetails.location}\n\nLooking forward to it! 🎉`
      
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

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelAppointment = async () => {
    try {
      setIsLoading(true);
      setIsCancelModalOpen(false);

      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId: bookingDetails.appointmentId }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to cancelled page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel appointment');
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* Appointment Details - Only show service info, no personal details */}
            <div className="bg-pink-50 rounded-lg p-6 mb-8">
              <h2 className="font-bold text-pink-500 mb-4 text-xl">Appointment Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p className="text-gray-600">Service:</p>
                <p className="font-medium">{bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service}</p>
                
                {bookingDetails.servicePrice && (
                  <>
                    <p className="text-gray-600">Price:</p>
                    <p className="font-medium">{bookingDetails.servicePrice}</p>
                  </>
                )}
                
                {bookingDetails.serviceDuration && (
                  <>
                    <p className="text-gray-600">Duration:</p>
                    <p className="font-medium">{bookingDetails.serviceDuration}</p>
                  </>
                )}

                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{bookingDetails.date}</p>

                <p className="text-gray-600">Time:</p>
                <p className="font-medium">{bookingDetails.time}</p>

                {/* Show nail details only if provided and for nail services */}
                {bookingDetails.service === 'nails' && bookingDetails.nailShape && (
                  <>
                    <p className="text-gray-600">Nail Shape:</p>
                    <p className="font-medium">{bookingDetails.nailShape}</p>
                  </>
                )}

                {bookingDetails.service === 'nails' && bookingDetails.nailDesign && (
                  <>
                    <p className="text-gray-600">Nail Design:</p>
                    <p className="font-medium">{bookingDetails.nailDesign}</p>
                  </>
                )}

                {/* Show tattoo details only if provided and for tattoo services */}
                {bookingDetails.service === 'tattoo' && bookingDetails.tattooLocation && (
                  <>
                    <p className="text-gray-600">Tattoo Location:</p>
                    <p className="font-medium">{bookingDetails.tattooLocation}</p>
                  </>
                )}

                {bookingDetails.service === 'tattoo' && bookingDetails.tattooSize && (
                  <>
                    <p className="text-gray-600">Tattoo Size:</p>
                    <p className="font-medium">{bookingDetails.tattooSize}</p>
                  </>
                )}

                {/* Show reference image if uploaded */}
                {bookingDetails.referenceImage && (
                  <>
                    <p className="text-gray-600">Reference Image:</p>
                    <p className="font-medium text-green-600">Uploaded ✓</p>
                  </>
                )}
              </div>
            </div>
            
            {/* No customer details displayed for privacy reasons */}

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
                        <p className="text-gray-600">pearl4nails@gmail.com</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-pink-500" />
                        <p className="text-gray-600">09160763206</p>
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
            <AlertDialogAction onClick={handleCancelAppointment} disabled={isLoading}>
              {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
