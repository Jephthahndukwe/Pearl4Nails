'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { RegistrationForm } from "@/components/training/registration-form"
import { useState } from "react"

export default function TrainingPage() {
  const trainingCourses = [
    {
      id: "nail-art",
      title: "Professional Nail Art",
      description: "Learn the art of nail design from basic to advanced techniques.",
      duration: "4 weeks",
      features: [
        "Basic and advanced nail art techniques",
        "Proper tool handling and maintenance",
        "Client consultation skills",
        "Business setup guidance",
      ],
      price: "$499",
      image: "/images/Nail.jpg",
    },
    {
      id: "lash-extensions",
      title: "Lash Extension Mastery",
      description: "Master the art of applying stunning lash extensions.",
      duration: "2 weeks",
      features: [
        "Classic and volume lash application",
        "Lash health and maintenance",
        "Client consultation skills",
        "Business setup guidance",
      ],
      price: "$399",
      image: "/images/lashExtension.jpg",
    },
    {
      id: "microblading",
      title: "Microblading Certification",
      description: "Learn the art of microblading for perfect eyebrows.",
      duration: "3 weeks",
      features: [
        "Eyebrow mapping and design",
        "Color theory and pigment selection",
        "Proper technique and aftercare",
        "Business setup guidance",
      ],
      price: "$599",
      image: "/images/MicroBlading.jpg",
    },
  ]

  const [showForm, setShowForm] = useState(false)

  const handleFormSubmit = async (data: any) => {
    try {
      // Here you would typically make an API call to submit the form data
      // For now, we'll just redirect to the success page
      window.location.href = '/training/success'
    } catch (error) {
      console.error('Error submitting form:', error)
      // Handle error (e.g., show error message to user)
    }
  }

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">Beauty Training Programs</h1>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          Learn from industry experts and master the art of beauty. Our comprehensive training programs are designed to
          equip you with the skills and knowledge needed to excel in the beauty industry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {trainingCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative h-60">
                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="text-pink-500">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Duration: {course.duration}</p>
                </div>
                <ul className="space-y-2">
                  {course.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-pink-500 mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-xl font-bold">{course.price}</p>
                <Button onClick={() => setShowForm(true)} className="bg-pink-500 hover:bg-pink-600">
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl relative h-[90vh]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Training Registration</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <RegistrationForm
                    courses={trainingCourses}
                    onSubmit={handleFormSubmit}
                  />
                </div>
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
