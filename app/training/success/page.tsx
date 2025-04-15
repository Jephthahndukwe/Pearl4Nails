'use client'

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Share, CheckCircle2 } from "lucide-react"
import { Toaster, toast } from "sonner"

interface TrainingDetails {
  id: string
  course: string
  date: string
}

// Client component that uses searchParams
function TrainingSuccessContent() {
  const searchParams = useSearchParams()
  const [trainingDetails, setTrainingDetails] = useState<TrainingDetails | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)

  useEffect(() => {
    // Get training details from URL parameters
    const registrationId = searchParams.get('id') || ''
    const courseName = searchParams.get('course') || ''
    const registrationDate = searchParams.get('date') || ''

    // Set training details
    if (registrationId && courseName) {
      setTrainingDetails({
        id: registrationId,
        course: courseName,
        date: registrationDate
      })
    }
  }, [searchParams])

  const handleAddToCalendar = () => {
    setIsAddingToCalendar(true)
    try {
      // Generate Google Calendar link
      const title = `Pearl4Nails Training: ${trainingDetails?.course}`
      const details = `Your registration for ${trainingDetails?.course} has been confirmed. Registration ID: ${trainingDetails?.id}`
      const location = "15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria"
      
      // Add 7 days from now (placeholder for actual course start date)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 7)
      const endDate = new Date(startDate)
      endDate.setHours(startDate.getHours() + 3) // 3 hour session
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${startDate.toISOString().replace(/-|:|\.\d+/g, '')}/${endDate.toISOString().replace(/-|:|\.\d+/g, '')}`
      
      window.open(googleCalendarUrl, '_blank')
      toast.success("Added to calendar!")
    } catch (error) {
      console.error('Error adding to calendar:', error)
      toast.error("Failed to add to calendar")
    } finally {
      setIsAddingToCalendar(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const text = `I've registered for a ${trainingDetails?.course} training at Pearl4Nails!\n\nRegistration ID: ${trainingDetails?.id}\nDate: ${trainingDetails?.date}\nLocation: 15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria\n\nLooking forward to it! 🎉`
      
      if (navigator.share) {
        await navigator.share({
          title: "My Pearl4Nails Training Registration",
          text: text,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(text).then(() => {
          toast.success("Registration details copied to clipboard!")
        }).catch((err) => {
          console.error('Failed to copy:', err)
          toast.error("Failed to copy registration details")
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error("Failed to share registration details")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <main className="min-h-screen py-16 px-4 bg-gray-50">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <CheckCircle2 className="mx-auto h-20 w-20 text-pink-500" />
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Application Submitted!</h1>
          <p className="text-xl text-gray-700 mb-8">
            Thank you for your interest in our training programs. We have received your application and will be in touch with
            you shortly to discuss next steps.
          </p>
        </div>

        {trainingDetails && (
          <div className="bg-pink-50 rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-pink-500 mb-4 text-xl">Registration Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p className="text-gray-600">Course:</p>
              <p className="font-medium">{trainingDetails.course}</p>

              <p className="text-gray-600">Registration Date:</p>
              <p className="font-medium">{trainingDetails.date}</p>

              <p className="text-gray-600">Registration ID:</p>
              <p className="font-medium">{trainingDetails.id}</p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-gray-700 font-medium">
            In the meantime, you can:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-pink-500 mr-2 shrink-0" />
              <span>Prepare any additional documents you might need</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-pink-500 mr-2 shrink-0" />
              <span>Review our training schedule and requirements</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-pink-500 mr-2 shrink-0" />
              <span>Get ready for your interview if applicable</span>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleAddToCalendar} 
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600"
              disabled={isAddingToCalendar}
            >
              <Calendar className="h-5 w-5" />
              {isAddingToCalendar ? 'Adding...' : 'Add to Calendar'}
            </Button>
            <Button 
              onClick={handleShare} 
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600"
              disabled={isSharing}
            >
              <Share className="h-5 w-5" />
              {isSharing ? 'Sharing...' : 'Share Details'}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link href="/training" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
              View More Courses
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 border-pink-200">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

// Loading state for Suspense boundary
function TrainingSuccessLoading() {
  return (
    <main className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-pink-100 animate-pulse"></div>
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Application Submitted!</h1>
          <p className="text-xl text-gray-700 mb-8">
            Loading your registration details...
          </p>
        </div>
        <div className="bg-pink-50 rounded-lg p-6 mb-8 shadow-sm animate-pulse">
          <div className="h-6 bg-pink-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-pink-100 rounded"></div>
            <div className="h-4 bg-pink-100 rounded"></div>
            <div className="h-4 bg-pink-100 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Main page component that wraps the client component in a Suspense boundary
export default function TrainingSuccessPage() {
  return (
    <Suspense fallback={<TrainingSuccessLoading />}>
      <TrainingSuccessContent />
    </Suspense>
  )
}
