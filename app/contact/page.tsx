"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { MapPin, Phone, Mail } from "lucide-react"
import SocialLinks from "@/components/social-links"
import WhatsAppQR from "@/components/whatsapp-qr"

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus("submitting")

    // Simulate form submission
    setTimeout(() => {
      setFormStatus("success")
    }, 1500)
  }

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">Contact Us</h1>
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
          Have questions or want to book an appointment? Reach out to us and we'll get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-pink-500 mb-6">Send Us a Message</h2>
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this regarding?" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px]" required />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  disabled={formStatus === "submitting"}
                >
                  {formStatus === "submitting" ? "Sending..." : "Send Message"}
                </Button>

                {formStatus === "success" && (
                  <p className="text-green-600 text-center">Your message has been sent! We'll get back to you soon.</p>
                )}

                {formStatus === "error" && (
                  <p className="text-red-600 text-center">There was an error sending your message. Please try again.</p>
                )}
              </form>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-pink-500 mb-6">Contact Information</h2>
            <Card className="p-6 mb-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-pink-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone / WhatsApp</h3>
                    <p className="text-gray-600">09160763206</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-pink-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">nwabuezemercy2@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-pink-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </Card>

            <h2 className="text-2xl font-bold text-pink-500 mb-6">Connect With Us</h2>
            <Card className="p-6">
              <div className="flex flex-col items-center space-y-6">
                <SocialLinks />
                <div className="w-full border-t pt-6">
                  <h3 className="font-medium text-center mb-4">Scan to Chat on WhatsApp</h3>
                  <WhatsAppQR />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

