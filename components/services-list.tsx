import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ServicesListProps {
  featured?: boolean
}

export default function ServicesList({ featured = false }: ServicesListProps) {
  const services = [
    {
      id: "nails",
      name: "Nails",
      description: "Custom nail designs, extensions, and nail art to match your style.",
      // price: "$50+",
      image: "/images/Nail.jpg?height=300&width=400&text=Nails",
    },
    {
      id: "lashes",
      name: "Lash Extensions",
      description: "Enhance your natural lashes with our premium lash extension services.",
      // price: "$80+",
      image: "/images/lashExtension.jpg?height=300&width=400&text=Lashes",
    },
    {
      id: "microblading",
      name: "Microblading",
      description: "Achieve perfect eyebrows with our professional microblading services.",
      // price: "$120+",
      image: "/images/MicroBlading.jpg?height=300&width=400&text=Microblading",
    },
    {
      id: "makeup",
      name: "Makeup",
      description: "Professional makeup services for any occasion, from natural to glam.",
      // price: "$60+",
      image: "/images/Makeup.jpg?height=300&width=400&text=Makeup",
    },
    {
      id: "manicure",
      name: "Manicure & Pedicure",
      description: "Pamper your hands and feet with our relaxing manicure and pedicure services.",
      // price: "$45+",
      image: "/images/Manicure&pedicure.jpg?height=300&width=400&text=Manicure",
    },
    {
      id: "piercing",
      name: "Piercing",
      description: "Safe and professional piercing services with a variety of jewelry options.",
      // price: "$30+",
      image: "/images/Piercing.jpg?height=300&width=400&text=Piercing",
    },
    {
      id: "tooth-gems",
      name: "Tooth Gems",
      description: "Add a sparkle to your smile with our tooth gem application services.",
      // price: "$25+",
      image: "/images/Toothgem.jpg?height=300&width=400&text=ToothGems",
    },
    {
      id: "brow",
      name: "Brow Trimming",
      description: "Shape and define your eyebrows with our professional brow trimming services.",
      // price: "$20+",
      image: "/images/BrowTrimming.jpg?height=300&width=400&text=BrowTrimming",
    },
    // {
    //   id: "hair",
    //   name: "Hair Revamping",
    //   description: "Transform your hair with our professional styling and treatment services.",
    //   // price: "$70+",
    //   image: "/images/WigRevamp.jpg?height=300&width=400&text=HairRevamping",
    // },
    // {
    //   id: "tattoo",
    //   name: "Tattoo",
    //   description: "Professional tattoo services with experienced artists and a variety of styles.",
    //   // price: "$150+",
    //   image: "/images/Tattoo.jpg?height=300&width=400&text=Tattoo",
    // }
  ]

  const displayServices = featured ? services.slice(0, 6) : services

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayServices.map((service) => (
        <Card key={service.id} className="overflow-hidden">
          <div className="relative h-60">
            <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
          </div>
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            {/* <p className="font-bold">{service.price}</p> */}
            <Button asChild className="bg-pink-500 hover:bg-pink-600">
              <Link href="/booking">Book Now</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
