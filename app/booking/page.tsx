"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, ChevronRight, Upload, Info, CalendarPlus, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { serviceCategories, findServiceById, findServiceTypeById } from "@/types/service"

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [step, setStep] = useState(1)

  // Modified for multiple service selection
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<Record<string, string>>({})
  const [totalDuration, setTotalDuration] = useState<number>(0)

  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedNailShape, setSelectedNailShape] = useState<string | null>(null)
  const [selectedNailDesign, setSelectedNailDesign] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [tattooLocation, setTattooLocation] = useState<string | null>(null)
  const [tattooSize, setTattooSize] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ time: string; isAvailable: boolean }[]>([])
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Service data is now imported from types/service.ts

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

  // Duration calculation functions
  const calculateTotalDuration = (services: string[], serviceTypes: Record<string, string>) => {
    let total = 0

    Object.entries(serviceTypes).forEach(([serviceId, typeId]) => {
      if (services.includes(serviceId)) {
        const serviceType = findServiceTypeById(serviceId, typeId)
        if (serviceType) {
          const durationStr = serviceType.duration

          // Handle various duration formats
          // Format: "2 h 30 mins" or "1 h 30 min" or "45 min" or "1 h"
          const hourMatch = durationStr.match(/(\d+)\s*h/)
          const minuteMatch = durationStr.match(/(\d+)\s*min/)

          if (hourMatch) {
            total += Number.parseInt(hourMatch[1]) * 60 // Convert hours to minutes
          }

          if (minuteMatch) {
            total += Number.parseInt(minuteMatch[1])
          }
        }
      }
    })

    return total // Return total minutes
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins > 1 ? "s" : ""}`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`
    } else {
      return `${mins} minute${mins > 1 ? "s" : ""}`
    }
  }

  const getBlockedTimeSlots = (startTime: string, durationMinutes: number) => {
    const [hourStr, minuteStr, period] = startTime.match(/(\d+):(\d+)\s*(AM|PM)/).slice(1)
    let hour = Number.parseInt(hourStr)
    const minute = Number.parseInt(minuteStr)

    if (period === "PM" && hour < 12) hour += 12
    if (period === "AM" && hour === 12) hour = 0

    const startMinutes = hour * 60 + minute
    const endMinutes = startMinutes + durationMinutes

    return availableTimeSlots
      .filter((slot) => {
        const [slotHourStr, slotMinuteStr, slotPeriod] = slot.time.match(/(\d+):(\d+)\s*(AM|PM)/).slice(1)
        let slotHour = Number.parseInt(slotHourStr)
        const slotMinute = Number.parseInt(slotMinuteStr)

        if (slotPeriod === "PM" && slotHour < 12) slotHour += 12
        if (slotPeriod === "AM" && slotHour === 12) slotHour = 0

        const slotMinutes = slotHour * 60 + slotMinute
        return slotMinutes > startMinutes && slotMinutes < endMinutes
      })
      .map((slot) => slot.time)
  }

  // Default time slots fallback for client-side when API fails
  const getDefaultTimeSlots = (selectedDate: Date) => {
    const dayOfWeek = selectedDate.getDay() // 0 for Sunday, 1 for Monday, etc.

    // Default business hours (9am to 8pm)
    const allTimeSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
      "07:00 PM",
      "08:00 PM",
    ]

    // Generate some random availability for fallback use
    return allTimeSlots.map((time) => ({
      time,
      // Make some slots unavailable based on day of week as a pattern
      isAvailable:
        !(dayOfWeek === 0 && ["09:00 AM", "10:00 AM"].includes(time)) &&
        !(dayOfWeek === 1 && ["07:00 PM", "08:00 PM"].includes(time)) &&
        !(Math.random() > 0.8), // Randomly make ~20% of slots unavailable
    }))
  }

  useEffect(() => {
    let isMounted = true

    const fetchAvailableTimeSlots = async () => {
      if (!date) return

      try {
        // Show loading state
        setTimeSlotsError(null)

        // Simple fetch with no race conditions or timeouts
        const response = await fetch(`/api/booking/available-time-slots?date=${date.toISOString()}&_=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          // Force network request to prevent browser caching
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Server error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        if (data.message) {
          console.log("API message:", data.message)
        }

        if (isMounted) {
          setAvailableTimeSlots(data.timeSlots || [])
          setTimeSlotsError(data.message || null)
        }
      } catch (error) {
        console.error("Error fetching time slots:", error)

        if (isMounted) {
          setAvailableTimeSlots([])
          setTimeSlotsError("Could not load time slots. Please try again later.")
        }
      } finally {
        if (isMounted) {
          // We're done loading
          // (No explicit loading state to set)
        }
      }
    }

    fetchAvailableTimeSlots()

    return () => {
      isMounted = false
    }
  }, [date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (selectedServices.length === 0 || !date || !selectedTime) {
        throw new Error("Please select services, date, and time")
      }

      const customerName = (document.getElementById("name") as HTMLInputElement)?.value || ""
      const customerEmail = (document.getElementById("email") as HTMLInputElement)?.value || ""
      const customerPhone = (document.getElementById("phone") as HTMLInputElement)?.value || ""
      const customerNotes = (document.getElementById("notes") as HTMLTextAreaElement)?.value || ""

      const response = await fetch("/api/booking/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          services: selectedServices.map((serviceId) => ({
            id: serviceId,
            name: findServiceById(serviceId)?.name || "",
            typeId: selectedServiceTypes[serviceId],
            typeName: findServiceTypeById(serviceId, selectedServiceTypes[serviceId])?.name || "",
            price: findServiceTypeById(serviceId, selectedServiceTypes[serviceId])?.price || "",
            duration: findServiceTypeById(serviceId, selectedServiceTypes[serviceId])?.duration || "",
          })),
          totalDuration: formatDuration(totalDuration),
          date: date?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          time: selectedTime,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          notes: customerNotes,
          nailShape: selectedNailShape || "",
          nailDesign: selectedNailDesign || "",
          tattooLocation: tattooLocation || "",
          tattooSize: tattooSize || "",
          referenceImage: referenceImage || "",
          location: selectedLocation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm booking")
      }

      // Pass only appointment and service details to success page using URL search params - no customer info
      const url = new URL("/booking/success", window.location.origin)
      url.searchParams.set("appointmentId", data.appointmentId)
      url.searchParams.set("services", JSON.stringify(selectedServices))
      url.searchParams.set("serviceTypes", JSON.stringify(selectedServiceTypes))
      
      // Include service details for the first service (legacy support)
      if (selectedServices.length > 0) {
        const firstService = selectedServices[0];
        const firstServiceType = selectedServiceTypes[firstService];
        const serviceType = findServiceTypeById(firstService, firstServiceType);
        
        if (serviceType) {
          url.searchParams.set("service", firstService);
          url.searchParams.set("serviceType", firstServiceType);
          url.searchParams.set("serviceName", findServiceById(firstService)?.name || "");
          url.searchParams.set("serviceTypeName", serviceType.name || "");
          url.searchParams.set("servicePrice", serviceType.price || "");
          url.searchParams.set("serviceDuration", serviceType.duration || "");
        }
      }
      
      url.searchParams.set("date", date?.toLocaleDateString())
      url.searchParams.set("time", selectedTime)
      url.searchParams.set("totalDuration", formatDuration(totalDuration))

      // Add location parameter
      if (selectedLocation) {
        url.searchParams.set("location", selectedLocation)
      }

      if (selectedServices.includes("nails")) {
        if (selectedNailShape) url.searchParams.set("nailShape", selectedNailShape)
        if (selectedNailDesign) url.searchParams.set("nailDesign", selectedNailDesign)
      }

      if (selectedServices.includes("tattoo")) {
        if (tattooLocation) url.searchParams.set("tattooLocation", tattooLocation)
        if (tattooSize) url.searchParams.set("tattooSize", tattooSize)
      }

      if (referenceImage) url.searchParams.set("referenceImage", "yes")

      window.location.href = url.toString()
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Failed to confirm booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to advance to the next step
  const nextStep = () => {
    // Only manually advance when Next button is clicked
    if (step === 1 && selectedServices.length > 0) {
      // If services are selected, go to service type selection
      setStep(2)
    } else if (step === 2 && selectedServices.every((service) => selectedServiceTypes[service])) {
      // If all service types are selected, go to date/time selection
      setStep(3)
    } else {
      setStep(step + 1)
    }
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    if (step === 2) {
      // If at service type selection, go back to service selection
      setStep(1)
    } else if (step === 3) {
      // If at date/time selection, go back to service type selection
      setStep(2)
    } else {
      setStep(step - 1)
    }
    window.scrollTo(0, 0)
  }

  // Reset service type when changing service category
  useEffect(() => {
    // Clear service types that are no longer selected
    const updatedServiceTypes = { ...selectedServiceTypes }
    Object.keys(updatedServiceTypes).forEach((serviceId) => {
      if (!selectedServices.includes(serviceId)) {
        delete updatedServiceTypes[serviceId]
      }
    })
    setSelectedServiceTypes(updatedServiceTypes)

    // Recalculate duration
    const newDuration = calculateTotalDuration(selectedServices, updatedServiceTypes)
    setTotalDuration(newDuration)
  }, [selectedServices])

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
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    try {
      const response = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId: "12345" }), // Replace with actual appointment ID
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || "Failed to cancel booking")
      }

      alert("Appointment cancelled successfully")
      window.location.href = "/booking/cancelled"
    } catch (error) {
      console.error("Cancellation failed:", error)
      alert(error instanceof Error ? error.message : "An error occurred while cancelling. Please try again later.")
    }
  }

  const handleTimeSlotClick = (time: string, isAvailable: boolean) => {
    if (isAvailable) {
      // Check if there are enough consecutive available slots for the total duration
      const blockedSlots = getBlockedTimeSlots(time, totalDuration)
      const unavailableBlockedSlot = blockedSlots.find(
        (slot) => !availableTimeSlots.find((ts) => ts.time === slot)?.isAvailable,
      )

      if (unavailableBlockedSlot) {
        alert(
          `This appointment requires ${formatDuration(totalDuration)} and would conflict with an existing booking at ${unavailableBlockedSlot}. Please select a different time.`,
        )
        return
      }

      setSelectedTime(time)
    } else {
      alert("This time slot is already booked")
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
                <p className="text-gray-600">Services:</p>
                <div>
                  {selectedServices.map((serviceId) => {
                    const service = findServiceById(serviceId)
                    return (
                      <p key={serviceId} className="font-medium">
                        {service?.name}
                      </p>
                    )
                  })}
                </div>

                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{date?.toLocaleDateString()}</p>

                <p className="text-gray-600">Time:</p>
                <p className="font-medium">{selectedTime}</p>

                <p className="text-gray-600">Duration:</p>
                <p className="font-medium">{formatDuration(totalDuration)}</p>

                {selectedServices.includes("nails") && selectedNailShape && (
                  <>
                    <p className="text-gray-600">Nail Shape:</p>
                    <p className="font-medium">{nailShapes.find((s) => s.id === selectedNailShape)?.name}</p>
                  </>
                )}

                {selectedServices.includes("nails") && selectedNailDesign && (
                  <>
                    <p className="text-gray-600">Nail Design:</p>
                    <p className="font-medium">{nailDesigns.find((d) => d.id === selectedNailDesign)?.name}</p>
                  </>
                )}

                {selectedServices.includes("tattoo") && tattooLocation && (
                  <>
                    <p className="text-gray-600">Tattoo Location:</p>
                    <p className="font-medium">{tattooLocation}</p>
                  </>
                )}

                {selectedServices.includes("tattoo") && tattooSize && (
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
          Select your preferred services, date, and time, and we'll take care of the rest.
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
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
                      ? "Service Type"
                      : i === 3
                        ? "Date & Time"
                        : i === 4
                          ? "Customization"
                          : "Details"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Select Service Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {serviceCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedServices.includes(category.id)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                    onClick={() => {
                      // Toggle service selection
                      if (selectedServices.includes(category.id)) {
                        setSelectedServices(selectedServices.filter((id) => id !== category.id))
                      } else {
                        setSelectedServices([...selectedServices, category.id])
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-gray-500 text-sm">{category.types.length} services available</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          selectedServices.includes(category.id) ? "border-pink-500 bg-pink-500" : "border-gray-300"
                        }`}
                      >
                        {selectedServices.includes(category.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedServices.length > 0 && (
                <div className="mb-6 bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-medium text-pink-500 mb-2">Selected Services</h3>
                  <div className="space-y-1">
                    {selectedServices.map((serviceId) => {
                      const service = findServiceById(serviceId)
                      return (
                        <div key={serviceId} className="flex justify-between items-center">
                          <p className="font-medium">{service?.name}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={selectedServices.length === 0}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedServices.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Select Service Types</h2>

              {selectedServices.map((serviceId) => {
                const service = findServiceById(serviceId)
                return (
                  <div key={serviceId} className="mb-8">
                    <h3 className="text-xl font-medium mb-4">{service?.name}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {service?.types.map((type) => (
                        <div
                          key={type.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedServiceTypes[serviceId] === type.id
                              ? "border-pink-500 bg-pink-50"
                              : "border-gray-200 hover:border-pink-300"
                          }`}
                          onClick={() => {
                            const updatedServiceTypes = { ...selectedServiceTypes }
                            updatedServiceTypes[serviceId] = type.id
                            setSelectedServiceTypes(updatedServiceTypes)

                            // Calculate new total duration
                            const newDuration = calculateTotalDuration(selectedServices, updatedServiceTypes)
                            setTotalDuration(newDuration)
                          }}
                        >
                          <div className="flex flex-col sm:flex-row justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{type.name}</h4>
                              <p className="text-gray-600 text-sm mt-1">{type.description}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                              <div className="flex items-center text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="text-sm">{type.duration}</span>
                              </div>
                              <p className="font-bold text-pink-500">{type.price}</p>
                              <div
                                className={`w-5 h-5 rounded-full border ${
                                  selectedServiceTypes[serviceId] === type.id
                                    ? "border-pink-500 bg-pink-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedServiceTypes[serviceId] === type.id && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {totalDuration > 0 && (
                <div className="mt-6 mb-4 bg-pink-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-pink-500">Total Duration:</p>
                    <p className="font-bold text-pink-600">{formatDuration(totalDuration)}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="border-pink-500 text-pink-500">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={selectedServices.some((service) => !selectedServiceTypes[service])}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
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
                  {totalDuration > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Your appointment will take {formatDuration(totalDuration)}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlotsError ? (
                      <div className="col-span-2 text-red-500 text-center">{timeSlotsError}</div>
                    ) : (
                      availableTimeSlots.map((slot) => {
                        const isBlocked =
                          selectedTime && getBlockedTimeSlots(selectedTime, totalDuration).includes(slot.time)

                        // Safe time parsing with fallback
                        const timeDisplay = slot.time
                          ? (() => {
                              try {
                                const timeParts = slot.time.split(":")
                                if (timeParts.length >= 2) {
                                  const hour = timeParts[0].padStart(2, "0")
                                  const minutePart = timeParts[1].split(" ")[0].padStart(2, "0")
                                  return `${hour}:${minutePart}`
                                }
                                return slot.time
                              } catch (e) {
                                return slot.time || "Invalid Time"
                              }
                            })()
                          : "Invalid Time"

                        return (
                          <div
                            key={slot.time || Math.random()}
                            className={`border rounded-lg p-3 text-center cursor-pointer transition-all relative ${
                              selectedTime === slot.time
                                ? "border-pink-500 bg-pink-50 text-pink-600"
                                : isBlocked
                                  ? "border-pink-200 bg-pink-50 text-pink-300"
                                  : slot.isAvailable
                                    ? "hover:bg-gray-50"
                                    : "bg-gray-200 cursor-not-allowed"
                            } ${!slot.isAvailable && "opacity-75 filter blur-sm"}`}
                            onClick={() => handleTimeSlotClick(slot.time, slot.isAvailable)}
                            style={{
                              pointerEvents: !slot.isAvailable ? "none" : "auto",
                            }}
                            title={
                              selectedTime === slot.time
                                ? "Selected start time"
                                : isBlocked
                                  ? "This slot will be part of your appointment"
                                  : slot.isAvailable
                                    ? undefined
                                    : "This time slot is already booked"
                            }
                          >
                            {timeDisplay}
                            {isBlocked && (
                              <span className="absolute inset-0 flex items-center justify-center text-xs">
                                Part of appointment
                              </span>
                            )}
                          </div>
                        )
                      })
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

          {step === 4 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-pink-500 mb-6">Customize Your Services</h2>

              {selectedServices.includes("nails") && (
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
                                src={`/images/${shape.name}.jpg`}
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

              {selectedServices.includes("tattoo") && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tattoo-location">Tattoo Location</Label>
                      <select
                        id="tattoo-location"
                        value={tattooLocation || ""}
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
                        value={tattooSize || ""}
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
                          src={referenceImage || "/placeholder.svg?height=200&width=300"}
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

              {!selectedServices.includes("nails") && !selectedServices.includes("tattoo") && (
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

          {step === 5 && (
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
                    <Label htmlFor="location">Preferred Location</Label>
                    <select
                      id="location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria">
                        15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria
                      </option>
                      <option value="Iyana Ejigbo round at Munchiba tech, Lagos, Nigeria">
                        Iyana Ejigbo round at Munchiba tech, Lagos, Nigeria
                      </option>
                    </select>
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
                  <p className="text-gray-600">Services:</p>
                  <div>
                    {selectedServices.map((serviceId) => {
                      const service = findServiceById(serviceId)
                      const serviceType = selectedServiceTypes[serviceId]
                        ? findServiceTypeById(serviceId, selectedServiceTypes[serviceId])
                        : null
                      return (
                        <div key={serviceId}>
                          <p className="font-medium">{service?.name}</p>
                          {serviceType && (
                            <p className="text-xs text-gray-500">
                              {serviceType.name} - {serviceType.duration}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-gray-600">Total Duration:</p>
                  <p className="font-medium">{formatDuration(totalDuration)}</p>

                  <p className="text-gray-600">Location:</p>
                  <p>{selectedLocation}</p>

                  <p className="text-gray-600">Date:</p>
                  <p>{date?.toLocaleDateString()}</p>

                  <p className="text-gray-600">Time:</p>
                  <p>{selectedTime}</p>

                  {selectedServices.includes("nails") && selectedNailShape && (
                    <>
                      <p className="text-gray-600">Nail Shape:</p>
                      <p>{nailShapes.find((s) => s.id === selectedNailShape)?.name}</p>
                    </>
                  )}

                  {selectedServices.includes("nails") && selectedNailDesign && (
                    <>
                      <p className="text-gray-600">Nail Design:</p>
                      <p>{nailDesigns.find((d) => d.id === selectedNailDesign)?.name}</p>
                    </>
                  )}

                  {selectedServices.includes("tattoo") && tattooLocation && (
                    <>
                      <p className="text-gray-600">Tattoo Location:</p>
                      <p>{tattooLocation}</p>
                    </>
                  )}

                  {selectedServices.includes("tattoo") && tattooSize && (
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
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600" disabled={isSubmitting}>
                  {isSubmitting ? "Booking..." : "Complete Booking"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}