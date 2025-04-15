"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, ChevronRight, Upload, Info, CalendarPlus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedNailShape, setSelectedNailShape] = useState<string | null>(null)
  const [selectedNailDesign, setSelectedNailDesign] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [tattooLocation, setTattooLocation] = useState<string | null>(null)
  const [tattooSize, setTattooSize] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ time: string; isAvailable: boolean }[]>([])
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const services = [
    { id: "nails", name: "Nails", price: "$50+" },
    { id: "lashes", name: "Lash Extensions", price: "$80+" },
    { id: "microblading", name: "Microblading", price: "$120+" },
    { id: "makeup", name: "Makeup", price: "$60+" },
    { id: "manicure", name: "Manicure & Pedicure", price: "$45+" },
    { id: "piercing", name: "Piercing", price: "$30+" },
    { id: "tooth-gems", name: "Tooth Gems", price: "$25+" },
    { id: "brow", name: "Brow Trimming", price: "$20+" },
    { id: "hair", name: "Hair Revamping", price: "$70+" },
    { id: "tattoo", name: "Tattoo", price: "$150+" },
  ]

  const nailShapes = [
    { id: "Stiletto", name: "Stiletto" },
    { id: "Almond", name: "Almond" },
    { id: "Square", name: "Square" },
    { id: "Oval", name: "Oval" },
    { id: "Coffin", name: "Coffin" },
    { id: "Round", name: "Round" },
  ]

  const nailDesigns = [
    { id: "French", name: "French Tips" },
    { id: "Ombre", name: "Ombre" },
    { id: "Glitter", name: "Glitter" },
    { id: "Floral", name: "Floral" },
    { id: "Geometric", name: "Geometric" },
    { id: "Rhinestones", name: "Rhinestones" },
  ]

  // Default time slots fallback for client-side when API fails
  const getDefaultTimeSlots = (selectedDate: Date) => {
    const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Default business hours (9am to 8pm)
    const allTimeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    // Generate some random availability for fallback use
    return allTimeSlots.map(time => ({
      time,
      // Make some slots unavailable based on day of week as a pattern
      isAvailable: !(dayOfWeek === 0 && ['09:00 AM', '10:00 AM'].includes(time)) && 
                   !(dayOfWeek === 1 && ['07:00 PM', '08:00 PM'].includes(time)) &&
                   !(Math.random() > 0.8) // Randomly make ~20% of slots unavailable
    }));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAvailableTimeSlots = async () => {
      try {
        if (!date) {
          if (isMounted) {
            setTimeSlotsError('Please select a date first');
            setAvailableTimeSlots([]);
          }
          return;
        }

        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        try {
          const response = await fetch(`/api/booking/available-time-slots?date=${date.toISOString()}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Invalid response from server' }));
            throw new Error(data.error || 'Failed to fetch available time slots');
          }
          
          const data = await response.json();
          
          // Check if we received the notice property which indicates fallback data
          if (data.notice) {
            console.warn('Using fallback time slots from API:', data.notice);
          }
          
          if (isMounted) {
            setAvailableTimeSlots(data.timeSlots || []);
            setTimeSlotsError(data.notice || null);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error('Fetch error:', fetchError);
          
          // If we get an AbortError or any other fetch error, use client-side fallback
          if (isMounted) {
            console.warn('Using client-side fallback time slots');
            // Make sure date is defined before calling getDefaultTimeSlots
            if (date) {
              const fallbackSlots = getDefaultTimeSlots(date);
              setAvailableTimeSlots(fallbackSlots);
              setTimeSlotsError('Using estimated availability. Please contact us to confirm your booking.');
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error in time slot fetch effect:', error);
          if (date) {
            const fallbackSlots = getDefaultTimeSlots(date);
            setAvailableTimeSlots(fallbackSlots);
            setTimeSlotsError('Using estimated availability. Please contact us to confirm your booking.');
          } else {
            setAvailableTimeSlots([]);
            setTimeSlotsError('Please select a date first');
          }
        }
      }
    };

    fetchAvailableTimeSlots();
    
    return () => {
      isMounted = false;
    };
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!selectedService || !date || !selectedTime) {
        throw new Error('Please select service, date, and time');
      }

      const customerName = (document.getElementById('name') as HTMLInputElement)?.value || '';
      const customerEmail = (document.getElementById('email') as HTMLInputElement)?.value || '';
      const customerPhone = (document.getElementById('phone') as HTMLInputElement)?.value || '';
      const customerNotes = (document.getElementById('notes') as HTMLTextAreaElement)?.value || '';

      const response = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedService,
          date: date?.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          time: selectedTime,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          notes: customerNotes,
          nailShape: selectedNailShape || '',
          nailDesign: selectedNailDesign || '',
          tattooLocation: tattooLocation || '',
          tattooSize: tattooSize || '',
          referenceImage: referenceImage || ''
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      // Pass only appointment and service details to success page using URL search params - no customer info
      const url = new URL('/booking/success', window.location.origin);
      url.searchParams.set('appointmentId', data.appointmentId);
      url.searchParams.set('service', selectedService);
      url.searchParams.set('date', date?.toLocaleDateString());
      url.searchParams.set('time', selectedTime);
      
      // Only pass service-specific details if provided
      if (selectedService === 'nails') {
        if (selectedNailShape) url.searchParams.set('nailShape', selectedNailShape);
        if (selectedNailDesign) url.searchParams.set('nailDesign', selectedNailDesign);
      }
      
      if (selectedService === 'tattoo') {
        if (tattooLocation) url.searchParams.set('tattooLocation', tattooLocation);
        if (tattooSize) url.searchParams.set('tattooSize', tattooSize);
      }
      
      if (referenceImage) url.searchParams.set('referenceImage', 'yes');
      
      window.location.href = url.toString();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to confirm booking');
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReferenceImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setReferenceImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId: '12345' }), // Replace with actual appointment ID
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Failed to cancel booking');
      }

      alert('Appointment cancelled successfully');
      window.location.href = '/booking/cancelled';
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while cancelling. Please try again later.');
    }
  };

  const handleTimeSlotClick = (time: string, isAvailable: boolean) => {
    if (isAvailable) {
      setSelectedTime(time);
    } else {
      alert('This time slot is already booked');
    }
  };

  if (isBookingComplete) {
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
                <p className="font-medium">
                  {services.find((s) => s.id === selectedService)?.name}
                </p>

                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{date?.toLocaleDateString()}</p>

                <p className="text-gray-600">Time:</p>
                <p className="font-medium">{selectedTime}</p>

                {selectedService === "nails" && selectedNailShape && (
                  <>
                    <p className="text-gray-600">Nail Shape:</p>
                    <p className="font-medium">
                      {nailShapes.find((s) => s.id === selectedNailShape)?.name}
                    </p>
                  </>
                )}

                {selectedService === "nails" && selectedNailDesign && (
                  <>
                    <p className="text-gray-600">Nail Design:</p>
                    <p className="font-medium">
                      {nailDesigns.find((d) => d.id === selectedNailDesign)?.name}
                    </p>
                  </>
                )}

                {selectedService === "tattoo" && tattooLocation && (
                  <>
                    <p className="text-gray-600">Tattoo Location:</p>
                    <p className="font-medium">{tattooLocation}</p>
                  </>
                )}

                {selectedService === "tattoo" && tattooSize && (
                  <>
                    <p className="text-gray-600">Tattoo Size:</p>
                    <p className="font-medium">{tattooSize}</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600">
                  <CalendarPlus className="h-4 w-4" />
                  Add to Calendar
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

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">Book Your Appointment</h1>
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
          Select your preferred service, date, and time, and we'll take care of the rest.
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex items-center ${i < step ? "text-pink-500" : i === step ? "text-pink-500" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    i < step
                      ? "bg-pink-500 text-white"
                      : i === step
                        ? "border-2 border-pink-500"
                        : "border-2 border-gray-300"
                  }`}
                >
                  {i < step ? <Check className="w-5 h-5" /> : i}
                </div>
                <span className="hidden sm:inline">
                  {i === 1
                    ? "Service"
                    : i === 2
                      ? "Date & Time"
                      : i === 3
                        ? "Customization"
                        : i === 4
                          ? "Details"
                          : "Payment"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Select a Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedService === service.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-gray-500 text-sm">{service.price}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          selectedService === service.id ? "border-pink-500 bg-pink-500" : "border-gray-300"
                        }`}
                      >
                        {selectedService === service.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!selectedService}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Select Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-medium mb-4">Select a Date</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      // Disable past dates and Sundays
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today || date.getDay() === 0
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-4">Select a Time</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlotsError ? (
                      <div className="col-span-2 text-red-500 text-center">{timeSlotsError}</div>
                    ) : (
                      availableTimeSlots.map((slot) => (
                        <div
                          key={slot.time}
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all relative ${
                            selectedTime === slot.time
                              ? 'border-pink-500 bg-pink-50 text-pink-600'
                              : slot.isAvailable 
                                ? 'hover:bg-gray-50'
                                : 'bg-gray-200 cursor-not-allowed'
                          } ${
                            !slot.isAvailable &&
                            'opacity-75 filter blur-sm'
                          }`}
                          onClick={() => handleTimeSlotClick(slot.time, slot.isAvailable)}
                          style={{
                            pointerEvents: !slot.isAvailable ? 'none' : 'auto'
                          }}
                          title={slot.isAvailable ? undefined : 'This time slot is already booked'}
                        >
                          {slot.time.split(":")[0].padStart(2, "0")}:{slot.time.split(":")[1].padStart(2, "0")}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="border-pink-500 text-pink-500">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!date || !selectedTime}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Customize Your Service</h2>

              {selectedService === "nails" && (
                <div className="mb-8">
                  <Tabs defaultValue="shape" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="shape"
                        className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                      >
                        Nail Shape
                      </TabsTrigger>
                      <TabsTrigger
                        value="design"
                        className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                      >
                        Nail Design
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="shape" className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {nailShapes.map((shape) => (
                          <div
                            key={shape.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedNailShape === shape.id
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-200 hover:border-pink-300"
                            }`}
                            onClick={() => setSelectedNailShape(shape.id)}
                          >
                            <div className="aspect-square relative mb-2">
                              <Image
                                src={`/images/${shape.id}.jpg`}
                                alt={shape.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <p className="text-center font-medium">{shape.name}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="design" className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {nailDesigns.map((design) => (
                          <div
                            key={design.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedNailDesign === design.id
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-200 hover:border-pink-300"
                            }`}
                            onClick={() => setSelectedNailDesign(design.id)}
                          >
                            <div className="aspect-square relative mb-2">
                              <Image
                                src={`/images/${design.id}.jpeg`}
                                alt={design.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <p className="text-center font-medium">{design.name}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {selectedService === "tattoo" && (
                <div className="mb-8">
                  <div>
                    <Label htmlFor="tattoo-location">Tattoo Location</Label>
                    <select
                      id="tattoo-location"
                      value={tattooLocation}
                      onChange={(e) => setTattooLocation(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select location</option>
                      <option value="arm">Arm</option>
                      <option value="leg">Leg</option>
                      <option value="back">Back</option>
                      <option value="chest">Chest</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="tattoo-size">Tattoo Size</Label>
                    <select
                      id="tattoo-size"
                      value={tattooSize}
                      onChange={(e) => setTattooSize(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select size</option>
                      <option value="small">Small (up to 3 inches)</option>
                      <option value="medium">Medium (3-6 inches)</option>
                      <option value="large">Large (6+ inches)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Reference Image Upload - For all services */}
              <div className="mb-8">
                <h3 className="font-medium mb-4">Upload Reference Image (Optional)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {referenceImage ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 mx-auto">
                        <Image
                          src={referenceImage || "/placeholder.svg"}
                          alt="Reference"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removeImage}
                        className="text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 mb-2">Drag and drop an image here, or click to select a file</p>
                      <p className="text-gray-400 text-sm mb-4">JPG, PNG or GIF (max. 5MB)</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-pink-500 text-pink-500"
                      >
                        Select File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>

              {selectedService !== "nails" && selectedService !== "tattoo" && (
                <div className="mb-8 p-6 bg-pink-50 rounded-lg">
                  <p className="text-gray-700">
                    Our technician will discuss your preferences during your appointment. If you have any specific
                    requests, please add them in the notes section on the next page.
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="border-pink-500 text-pink-500">
                  Back
                </Button>
                <Button type="button" onClick={nextStep} className="bg-pink-500 hover:bg-pink-600">
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Your Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" required />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter your phone number" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Special Requests or Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or information we should know?"
                    className="h-[158px]"
                  />
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4 mb-8">
                <h3 className="font-bold text-pink-500 mb-2">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">Service:</p>
                  <p>{services.find((s) => s.id === selectedService)?.name}</p>

                  <p className="text-gray-600">Date:</p>
                  <p>{date?.toLocaleDateString()}</p>

                  <p className="text-gray-600">Time:</p>
                  <p>{selectedTime}</p>

                  {selectedService === "nails" && selectedNailShape && (
                    <>
                      <p className="text-gray-600">Nail Shape:</p>
                      <p>{nailShapes.find((s) => s.id === selectedNailShape)?.name}</p>
                    </>
                  )}

                  {selectedService === "nails" && selectedNailDesign && (
                    <>
                      <p className="text-gray-600">Nail Design:</p>
                      <p>{nailDesigns.find((d) => d.id === selectedNailDesign)?.name}</p>
                    </>
                  )}

                  {selectedService === "tattoo" && tattooLocation && (
                    <>
                      <p className="text-gray-600">Tattoo Location:</p>
                      <p>{tattooLocation}</p>
                    </>
                  )}

                  {selectedService === "tattoo" && tattooSize && (
                    <>
                      <p className="text-gray-600">Tattoo Size:</p>
                      <p>{tattooSize}</p>
                    </>
                  )}

                  {referenceImage && (
                    <>
                      <p className="text-gray-600">Reference Image:</p>
                      <p>Uploaded ✓</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-start mb-4">
                  <Info className="h-5 w-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Cancellation & Rescheduling Policy</p>
                    <p>
                      You can cancel or reschedule your appointment up to 24 hours before the start time without any
                      penalty.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="border-pink-500 text-pink-500">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking...' : 'Complete Booking'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
