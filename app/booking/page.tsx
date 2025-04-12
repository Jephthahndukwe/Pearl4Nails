"use client"

import type React from "react"

import { useState, useRef } from "react"
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
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedNailShape, setSelectedNailShape] = useState<string | null>(null)
  const [selectedNailDesign, setSelectedNailDesign] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [tattooLocation, setTattooLocation] = useState<string | null>(null)
  const [tattooSize, setTattooSize] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
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
    { id: "french", name: "French Tips" },
    { id: "ombre", name: "Ombre" },
    { id: "glitter", name: "Glitter" },
    { id: "floral", name: "Floral" },
    { id: "geometric", name: "Geometric" },
    { id: "rhinestones", name: "Rhinestones" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Collect all booking details
      const bookingDetails = {
        service: services.find((s) => s.id === selectedService)?.name || '',
        date: date?.toLocaleDateString() || '',
        time: selectedTime || '',
        nailShape: selectedService === "nails" ? nailShapes.find((s) => s.id === selectedNailShape)?.name : '',
        nailDesign: selectedService === "nails" ? nailDesigns.find((d) => d.id === selectedNailDesign)?.name : '',
        tattooLocation: selectedService === "tattoo" ? tattooLocation : '',
        tattooSize: selectedService === "tattoo" ? tattooSize : '',
        referenceImage: referenceImage || '',
        customer: {
          name: (document.getElementById('name') as HTMLInputElement)?.value || '',
          email: (document.getElementById('email') as HTMLInputElement)?.value || '',
          phone: (document.getElementById('phone') as HTMLInputElement)?.value || '',
          notes: (document.getElementById('notes') as HTMLTextAreaElement)?.value || ''
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

      // Send booking details to API for confirmation
      const response = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || 'Failed to confirm booking')
      }

      // Pass booking details to success page using URL search params
      const searchParams = new URLSearchParams()
      Object.entries(bookingDetails).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value.toString())
        }
      })
      
      // Redirect to success page with booking details
      window.location.href = `/booking/success?${searchParams.toString()}`
    } catch (error) {
      console.error('Booking failed:', error)
      alert(error instanceof Error ? error.message : 'An error occurred while booking. Please try again later.')
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
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          selectedTime === time
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </div>
                    ))}
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
                                src={`/images/nail-designs/${design.id}.jpg`}
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
  )
}
