"use client"

import type React from "react"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/09160763206?text=${encodedMessage}`, "_blank")

    setMessage("")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 w-80 shadow-lg border-pink-100 animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-pink-500 text-white p-4 flex flex-row justify-between items-center rounded-t-lg">
            <div>
              <h3 className="font-bold">Chat with Pearl4nails</h3>
              <p className="text-xs text-white/80">We typically reply within minutes</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-pink-600 h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Hello! How can we help you today? Send us a message and we'll get back to you as soon as possible.
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg ${
          isOpen ? "bg-pink-600" : "bg-pink-500"
        } hover:bg-pink-600 transition-all duration-300`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        <span className="sr-only">Chat on WhatsApp</span>
      </Button>
    </div>
  )
}

