'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CalendarPlus, Info } from "lucide-react"
import { RegistrationForm } from "@/components/training/registration-form"
import { useState } from "react"

export default function TrainingPage() {
  const trainingCourses = [
    {
      id: "nail-art",
      title: "Professional Nail Art",
      description: "Learn the art of nail design from basic to advanced techniques.",
      durations: [
        { id: "4-weeks", name: "4 Weeks Course", description: "Intensive short course covering the basics" },
        { id: "3-months", name: "3 Months Course", description: "Comprehensive intermediate training" },
        { id: "6-months", name: "6 Months Course", description: "Professional-level complete training" }
      ],
      equipmentOptions: [
        { id: "provided", name: "Equipment Provided", description: "All tools and materials included" },
        { id: "self", name: "Bring Your Own Equipment", description: "Use your own tools (less expensive)" }
      ],
      features: [
        "Basic and advanced nail art techniques",
        "Proper tool handling and maintenance",
        "Client consultation skills",
        "Business setup guidance",
      ],
      priceMatrix: {
        "4-weeks-provided": "₦250,000",
        "4-weeks-self": "₦150,000",
        "3-months-provided": "₦500,000",
        "3-months-self": "₦350,000",
        "6-months-provided": "₦750,000",
        "6-months-self": "₦550,000"
      },
      basePrice: "₦150,000-₦750,000",
      image: "/images/Nail.jpg",
    },
    {
      id: "lash-extensions",
      title: "Lash Extension Mastery",
      description: "Master the art of applying stunning lash extensions.",
      durations: [
        { id: "1-week", name: "1 Week Course", description: "Quick intensive training" },
        { id: "2-weeks", name: "2 Weeks Course", description: "Complete comprehensive training" }
      ],
      equipmentOptions: [
        { id: "provided", name: "Equipment Provided", description: "All tools and materials included" },
        { id: "self", name: "Bring Your Own Equipment", description: "Use your own tools (less expensive)" }
      ],
      features: [
        "Classic and volume lash application",
        "Lash health and maintenance",
        "Client consultation skills",
        "Business setup guidance",
      ],
      priceMatrix: {
        "1-week-provided": "₦200,000",
        "1-week-self": "₦120,000",
        "2-weeks-provided": "₦300,000",
        "2-weeks-self": "₦220,000"
      },
      basePrice: "₦120,000-₦300,000",
      image: "/images/lashExtension.jpg",
    },
    {
      id: "microblading",
      title: "Microblading Certification",
      description: "Learn the art of microblading for perfect eyebrows.",
      durations: [
        { id: "3-days", name: "3 Days Course", description: "Fast-track intensive training" },
        { id: "1-week", name: "1 Week Course", description: "Complete comprehensive training" }
      ],
      equipmentOptions: [
        { id: "provided", name: "Equipment Provided", description: "All tools and materials included" },
        { id: "self", name: "Bring Your Own Equipment", description: "Use your own tools (less expensive)" }
      ],
      features: [
        "Eyebrow mapping and design",
        "Color theory and pigment selection",
        "Proper technique and aftercare",
        "Business setup guidance",
      ],
      priceMatrix: {
        "3-days-provided": "₦280,000",
        "3-days-self": "₦180,000",
        "1-week-provided": "₦380,000",
        "1-week-self": "₦280,000"
      },
      basePrice: "₦180,000-₦380,000",
      image: "/images/MicroBlading.jpg",
    },
  ]

  const [showForm, setShowForm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Make an API call to the training registration endpoint
      const response = await fetch('/api/training/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit training application');
      }
      
      // Redirect to the success page with the registration details
      window.location.href = result.redirectUrl;
    } catch (error) {
      console.error('Error submitting training form:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit training application');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">Beauty Training Programs</h1>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          Learn from industry experts and master the art of beauty. Our comprehensive training programs are designed to
          equip you with the skills and knowledge needed to excel in the beauty industry.
          </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {trainingCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              {/* Course Image Header */}
              <div className="relative h-56">
                <Image 
                  src={course.image || "/placeholder.svg"} 
                  alt={course.title} 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1">{course.title}</h3>
                  <div className="flex items-center">
                    <span className="text-white/80 text-sm">Starting from </span>
                    <span className="ml-1 text-white font-bold">{course.basePrice}</span>
                  </div>
                </div>
              </div>
              
              {/* Course Content */}
              <div className="p-5">
                <p className="text-gray-600 mb-6">{course.description}</p>
                
                {/* Duration Options */}
                <div className="mb-6">
                  <h4 className="text-gray-800 font-semibold mb-3 pb-2 border-b border-gray-200 flex items-center">
                    <CalendarPlus className="h-4 w-4 text-pink-500 mr-2" />
                    Program Duration Options
                  </h4>
                  
                  <div className="space-y-2">
                    {course.durations.map((duration) => (
                      <div key={duration.id} className="flex items-center bg-gray-50 rounded p-3">
                        <div className="w-3 h-3 rounded-full bg-pink-500 mr-3"></div>
                        <div>
                          <p className="font-medium text-gray-800">{duration.name}</p>
                          <p className="text-xs text-gray-500">{duration.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Equipment Options */}
                <div className="mb-6">
                  <h4 className="text-gray-800 font-semibold mb-3 pb-2 border-b border-gray-200 flex items-center">
                    <Info className="h-4 w-4 text-pink-500 mr-2" />
                    Equipment Options
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {course.equipmentOptions.map((option) => (
                      <div key={option.id} className="bg-gray-50 rounded p-3 text-center">
                        <p className="font-medium text-gray-800 text-sm">{option.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* What You'll Learn */}
                <div>
                  <h4 className="text-gray-800 font-semibold mb-3 pb-2 border-b border-gray-200">What You'll Learn</h4>
                  <ul className="space-y-2">
                    {course.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-pink-500 mr-2 shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Enroll Button */}
              <div className="px-5 pb-5">
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-6 border-b shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Training Registration</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <RegistrationForm
                  courses={trainingCourses}
                  onSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-pink-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Custom Training Programs</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Looking for a specific training program? We offer custom training programs tailored to your needs. Contact
            us to discuss your requirements and we'll create a program just for you.
          </p>
          <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
