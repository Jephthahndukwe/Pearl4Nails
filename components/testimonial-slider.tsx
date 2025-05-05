"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export default function TestimonialSlider() {
  const testimonials = [
    {
      id: 1,
      name: " Nelly ijeoma",
      image: "/images/client2.jpg?height=96&width=96&text=Sarah",
      role: "Regular Client",
      content:
        "I've been coming to Pearl4nails for over a year now and I'm always impressed with their work. The nail designs are creative and last for weeks. Highly recommend!",
      rating: 5,
    },
    {
      id: 2,
      name: "Rosemary Uche",
      image: "/images/client1.jpg?height=96&width=96&text=Michelle",
      role: "First-time Client",
      content:
        "My first experience at Pearl4nails was amazing! The lash extensions looked so natural and the technician was very professional. Will definitely be back!",
      rating: 5,
    },
    {
      id: 3,
      name: "Akobundu Precious",
      image: "/images/client3.jpg?height=96&width=96&text=Jessica",
      role: "Regular Client",
      content:
        "The microblading service at Pearl4nails completely transformed my look. The attention to detail is incredible and the results are long-lasting.",
      rating: 5,
    },
    {
      id: 4,
      name: "Amanda Brown",
      image: "/images/avatar.png?height=96&width=96&text=Amanda",
      role: "Regular Client",
      content:
        "I love the tooth gems! They add such a unique touch to my smile. The application was quick and painless, and they've lasted much longer than I expected.",
      rating: 4,
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const handlePrev = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-white">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex justify-center md:justify-start mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                      </div>

                      <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>

                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center mt-8 gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-pink-200 text-pink-500 hover:bg-pink-50 hover:text-pink-600"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous testimonial</span>
        </Button>

        {testimonials.map((_, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 p-0 rounded-full ${
              i === currentIndex ? "bg-pink-500" : "bg-pink-200 hover:bg-pink-300"
            }`}
            onClick={() => {
              setAutoplay(false)
              setCurrentIndex(i)
            }}
          >
            <span className="sr-only">Go to testimonial {i + 1}</span>
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-pink-200 text-pink-500 hover:bg-pink-50 hover:text-pink-600"
          onClick={handleNext}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next testimonial</span>
        </Button>
      </div>
    </div>
  )
}

