"use client"

import Image from "next/image"
import Link from "next/link"
import { Instagram, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import ServiceCard from "@/components/service-card"
import SocialLinks from "@/components/social-links"
import WhatsAppQR from "@/components/whatsapp-qr"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestimonialSlider from "@/components/testimonial-slider"
import TiktokIcon from "@/components/tiktok-icon"
import { Sparkles } from "lucide-react"
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const featuredServices = [
    {
      id: "nails",
      name: "Nail Art & Extensions",
      description: "Custom designs that express your unique style",
      // price: "$50+",
      image: "/images/Nail.jpg",
      popular: true,
    },
    {
      id: "lashes",
      name: "Lash Extensions",
      description: "Enhance your natural beauty with stunning lashes",
      // price: "$80+",
      image: "/images/lashExtension.jpg",
      popular: false,
    },
    {
      id: "makeup",
      name: "Professional Makeup",
      description: "Perfect for special occasions and photoshoots",
      // price: "$60+",
      image: "/images/Makeup.jpg",
      popular: true,
    }
  ]

  const avatars = [
    {
      id: 1,
      name: 'avatar'
    },
    {
      id: 2,
      name: 'avatar'
    },
    {
      id: 3,
      name: 'avatar'
    },
    {
      id: 4,
      name: 'avatar'
    },
  ]

   // Gallery image data with real image paths and fallbacks
  const galleryData = {
    nails: [
      { id: 1, src: "/images/gallery/Nail27.png", fallback: "/api/placeholder/300/300?text=Nails1", title: "Beauty Service" },
      { id: 2, src: "/images/gallery/Nail16.jpeg", fallback: "/api/placeholder/300/300?text=Nails2", title: "Beauty Service" },
      { id: 3, src: "/images/gallery/Nail10.jpeg", fallback: "/api/placeholder/300/300?text=Nails3", title: "Beauty Service" },
      { id: 4, src: "/images/gallery/Nail13.jpeg", fallback: "/api/placeholder/300/300?text=Nails4", title: "Beauty Service" }
    ],
    lashes: [
      { id: 1, src: "/images/gallery/Lashextension2.png", fallback: "/api/placeholder/300/300?text=Lashes1", title: "Beauty Service" },
      { id: 2, src: "/images/gallery/Lashextensipn1.png", fallback: "/api/placeholder/300/300?text=Lashes2", title: "Beauty Service" },
    ],
    makeup: [
      { id: 1, src: "/images/gallery/Makeup1.jpeg", fallback: "/api/placeholder/300/300?text=Makeup1", title: "Beauty Service" },
    ]
  };

  // Function for image error handling
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = e.target.dataset.fallback;
  };
  
  // Create a memoized combined array for the 'All' view
  const allImages = useMemo(() => {
    // Combine all images from different categories
    const combined = [
      ...galleryData.nails,
      ...galleryData.lashes, 
      ...galleryData.makeup
    ];
    
    // Shuffle the array for randomness (Fisher-Yates algorithm)
    const shuffled = [...combined];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Take up to 8 items
    return shuffled.slice(0, 8);
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('/images/Nail.jpeg?height=200&width=200')] bg-repeat"></div>
        </div>

        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-20 md:opacity-40">
          <div className="relative w-full h-full">
            <Image
              src="/images/Makeup.jpeg?height=800&width=600"
              alt="Beauty services collage"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-20 md:py-32 mb-[5%]">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
              Get 100% Satisfaction
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
              Elevate Your <span className="text-pink-100">Beauty</span> Experience
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-lg">
              Premium nail care and beauty services that help you express your unique style
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-pink-500 hover:bg-pink-50 text-lg px-8 rounded-full shadow-lg">
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-pink-500 hover:bg-white/20 text-lg px-8 rounded-full"
              >
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>

            {/* <div className="mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-pink-500 hover:bg-white/20 text-lg px-8 rounded-full"
              >
                <Link href="/nail-game">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try Our Nail Art Game!
                </Link>
              </Button>
            </div> */}

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-4">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image
                      src={`/images/${avatar.name}.png`}
                      alt={`Happy client`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm">From 200+ happy clients</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 lg:px-4 xs:px-2 bg-white relative overflow-hidden">
        <div className="lg:px-4 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge className="mb-2 bg-pink-100 text-pink-500 hover:bg-pink-200">Our Services</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Premium Beauty Services</h2>
            </div>
            <Link href="/services" className="group flex items-center text-pink-500 font-medium mt-4 md:mt-0">
              View all services
              <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-pink-50 to-pink-100 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200 rounded-full -mr-20 -mt-20 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-200 rounded-full -ml-10 -mb-10 opacity-50"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Trainings Available!</h3>
                <p className="text-gray-700 max-w-lg">
                  Learn from our experts and master the art of nail design, lash extensions, and more. Perfect for
                  beginners and professionals looking to enhance their skills.
                </p>
              </div>
              <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 rounded-full px-8">
                <Link href="/training">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute top-40 right-10 w-40 h-40 bg-pink-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-pink-100 rounded-full opacity-50"></div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        <div className="lg:px-4 mx-auto relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-2 bg-pink-100 text-pink-500 hover:bg-pink-200">Our Work</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stunning Results</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our gallery to see the beautiful work we've done for our clients
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8 bg-pink-50">
            <TabsTrigger value="all" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              All Work
            </TabsTrigger>
            <TabsTrigger value="nails" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              Nails
            </TabsTrigger>
            <TabsTrigger value="lashes" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              Lashes
            </TabsTrigger>
            <TabsTrigger value="makeup" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              Makeup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Display randomly combined items from all categories */}
              {allImages.map((item) => (
                <div key={`all-${item.id}`} className="group relative overflow-hidden rounded-xl aspect-square">
                  <div className="absolute inset-0">
                    <img
                      src={item.src}
                      data-fallback={item.fallback}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nails" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryData.nails.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-xl aspect-square">
                  <div className="absolute inset-0">
                    <img
                      src={item.src}
                      data-fallback={item.fallback}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

             <TabsContent value="lashes" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryData.lashes.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-xl aspect-square">
                  <div className="absolute inset-0">
                    <img
                      src={item.src}
                      data-fallback={item.fallback}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="makeup" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryData.makeup.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-xl aspect-square">
                  <div className="absolute inset-0">
                    <img
                      src={item.src}
                      data-fallback={item.fallback}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              className="border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full px-8"
            >
              <Link href="/gallery">View Full Gallery</Link>
            </Button>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="lg:px-4 mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-2 bg-pink-100 text-pink-500 hover:bg-pink-200">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about their experience with
              Pearl4nails.
            </p>
          </div>

          <TestimonialSlider />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-400 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat"></div>

        <div className="lg:px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Look?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Book your appointment today and experience the Pearl4nails difference. Get the look you've always wanted
              with our premium beauty services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-pink-500 hover:bg-pink-50 text-lg px-8 rounded-full">
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-pink-500 hover:bg-white/20 text-lg px-8 rounded-full"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute top-10 right-10 w-40 h-40 bg-pink-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-pink-300 rounded-full opacity-50"></div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="lg:px-4 mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-2 bg-pink-100 text-pink-500 hover:bg-pink-200">Connect With Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Follow Us on Social Media</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest work, promotions, and beauty tips by following us on social media.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { platform: 'instagram', image: '/images/socialImage.jpg', alt: 'Instagram post 1' },
              { platform: 'tiktok', video: '/videos/socialVideo.mp4', alt: 'TikTok video 1' },
              { platform: 'instagram', image: '/images/socialImage2.jpg', alt: 'Instagram post 2' },
              { platform: 'tiktok', video: '/videos/socialVideo2.mp4', alt: 'TikTok video 2' },
              { platform: 'instagram', image: '/images/socialImage3.jpg', alt: 'Instagram post 3' },
              { platform: 'tiktok', video: '/videos/socialVideo3.mp4', alt: 'TikTok video 3' },
              { platform: 'instagram', image: '/images/socialImage4.jpg', alt: 'Instagram post 4' },
              { platform: 'tiktok', video: '/videos/socialVideo4.mp4', alt: 'TikTok video 4' },
            ].map((post, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl aspect-square">
                {post.platform === 'instagram' ? (
                  <Image
                    src={post.image}
                    alt={post.alt}
                    fill={true}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <video
                    src={post.video}
                    alt={post.alt}
                    // className="object-contain w-full h-full"
                    autoPlay
                    fill="true"
                    loop
                    muted
                    playsInline
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                  <div className="text-white font-medium">
                    {post.platform === 'instagram' ? (
                    <p>@pearl4nails</p>
                  ) : (
                    <p>@pearl_4_nails</p>
                  )}
                  </div>
                  {post.platform === 'instagram' ? (
                    <Instagram className="text-white w-5 h-5" />
                  ) : (
                    <div className="w-5 h-5 text-white">
                      <TiktokIcon />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <SocialLinks size="lg" />
            <WhatsAppQR />
          </div>
        </div>
      </section>

     
    </main>
  )
}
