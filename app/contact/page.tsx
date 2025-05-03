"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { MapPin, Phone, Mail } from "lucide-react"
import SocialLinks from "@/components/social-links"
import WhatsAppQR from "@/components/whatsapp-qr"

export default function ContactPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">Contact Us</h1>
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
          Find us at our store location or reach out to us through various channels.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
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
                    <p className="text-gray-600">pearl4nails@gmail.com</p>
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

          <div>
            <h2 className="text-2xl font-bold text-pink-500 mb-6">Our Location</h2>
            <Card className="p-6">
              <div className="aspect-[4/3]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.754440047204!2d3.357327675041829!3d6.590293495478828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b90b579280117%3A0x5b7e6b6b6b6b6b6b!2s15%20Osolo%20Way%2C%20Ajao%20Estate%2C%20Lagos!5e0!3m2!1sen!2sng!4v1712919330000!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
