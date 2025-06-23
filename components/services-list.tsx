'use client'

import Image from "next/image"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { ArrowRight, Clock, Star, Users } from 'lucide-react';

interface ServicesListProps {
  featured?: boolean
}

export default function ServicesList({ featured = false }: ServicesListProps) {
  const [activeService, setActiveService] = useState(null);

  const services = [
    {
      id: "nails",
      name: "Nail Artistry",
      description: "Custom nail designs, extensions, and nail art to match your unique style and personality.",
      image: "/images/Nail.jpg",
      popularity: "Most Popular"
    },
    {
      id: "lashes",
      name: "Lash Extensions",
      description: "Enhance your natural lashes with our premium extension services for stunning, long-lasting results.",
      image: "/images/lashExtension.jpg",
      popularity: "Client Favorite"
    },
    {
      id: "microblading",
      name: "Microblading",
      description: "Achieve perfectly shaped, natural-looking eyebrows with our precision microblading technique.",
      image: "/images/MicroBlading.jpg",
      popularity: "Premium Service"
    },
    {
      id: "makeup",
      name: "Professional Makeup",
      description: "Expert makeup application for any occasion, from subtle everyday looks to glamorous evening styles.",
      image: "/images/Makeup.jpg",
      popularity: "Event Ready"
    },
    {
      id: "manicure",
      name: "Manicure & Pedicure",
      description: "Luxurious hand and foot treatments that pamper and rejuvenate your skin while perfecting your nails.",
      image: "/images/Manicure&pedicure.jpg",
      popularity: "Relaxing"
    },
    {
      id: "piercing",
      name: "Professional Piercing",
      description: "Safe, sterile piercing services with premium jewelry options and comprehensive aftercare guidance.",
      image: "/images/Piercing.jpg",
      popularity: "Safe & Clean"
    },
    {
      id: "tooth-gems",
      name: "Tooth Gems",
      description: "Add a subtle sparkle to your smile with our carefully applied, high-quality tooth gems.",
      image: "/images/Toothgem.jpg",
      popularity: "Trending"
    },
    {
      id: "brow",
      name: "Brow Shaping",
      description: "Expert eyebrow trimming and shaping to frame your face and enhance your natural beauty.",
      image: "/images/BrowTrimming.jpg",
      popularity: "Quick Touch-up"
    }
  ];

  return (
    <>
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" >
        {
          services.map((service) => (
            <div
              key={service.id}
              className="group cursor-pointer"
              onMouseEnter={() => setActiveService(service.id)}
              onMouseLeave={() => setActiveService(null)}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Popularity Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-neutral-700">{service.popularity}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-medium text-neutral-800">{service.name}</h3>
                  </div>

                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-neutral-500 ml-2">5.0</span>
                  </div>

                  {/* Book Button */}
                  <Link href="/booking" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 group">
                    <span className="font-medium">Book Appointment</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        }
      </div >

      {/* Stats Section */}
      < div className="mt-24 bg-white rounded-3xl p-12 shadow-sm border border-neutral-100" >
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <div className="text-4xl font-light text-pink-600 mb-2">500+</div>
            <div className="text-neutral-600 font-medium">Happy Clients</div>
          </div>
          <div>
            <div className="text-4xl font-light text-pink-600 mb-2">50+</div>
            <div className="text-neutral-600 font-medium">5-Star Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-light text-pink-600 mb-2">3+</div>
            <div className="text-neutral-600 font-medium">Years Experience</div>
          </div>
        </div>
      </div >

      {/* CTA Section */}
      < div className="text-center mt-16" >
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-6 px-12 rounded-2xl inline-block shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-medium mb-2">Ready to Book Your Appointment?</h3>
          <p className="text-pink-100 mb-4">Experience the Pearl4nails difference today</p>
          <button className="bg-white text-pink-600 px-8 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors duration-300">
            Schedule Now
          </button>
        </div>
      </div>
    </>
  )
}
