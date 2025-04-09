import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description: string
    price: string
    image: string
    popular?: boolean
  }
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative w-full h-64 overflow-hidden">
        <Image
          src={service.image || "/placeholder.svg?height=400&width=600"}
          alt={service.name}
          fill          
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {service.popular && <Badge className="absolute top-4 right-4 bg-pink-500 hover:bg-pink-600">Popular</Badge>}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-pink-500">{service.price}</p>
          <Button asChild variant="ghost" className="text-pink-500 hover:bg-pink-50 p-0 h-auto">
            <Link href="/booking" className="flex items-center">
              Book Now <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

