import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { nailImages, lashImages, microbladingImages, makeupImages, 
         manicureImages, piercingImages, toothGemsImages, browImages, 
         hairImages, tattooImages } from "@/components/gallery/images"
import { ImageGrid } from "@/components/gallery/image-grid"

export default function GalleryPage() {
  const services = [
    { id: "nails", name: "Nails", images: nailImages },
    { id: "lashes", name: "Lash Extensions", images: lashImages },
    { id: "microblading", name: "Microblading", images: microbladingImages },
    { id: "makeup", name: "Makeup", images: makeupImages },
    { id: "manicure", name: "Manicure & Pedicure", images: manicureImages },
    { id: "piercing", name: "Piercing", images: piercingImages },
    { id: "tooth-gems", name: "Tooth Gems", images: toothGemsImages },
    { id: "brow", name: "Brow Trimming", images: browImages },
    { id: "hair", name: "Hair Revamping", images: hairImages },
    { id: "tattoo", name: "Tattoo", images: tattooImages },
  ]

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="mx-auto lg:px-[50px] xs:px-2">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-12">Our Gallery</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 justify-center bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              All Work
            </TabsTrigger>
            {services.map((service) => (
              <TabsTrigger
                key={service.id}
                value={service.id}
                className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
              >
                {service.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="xs:mt-[55%] lg:mt-[2%]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {services.map((service, serviceIndex) => (
                <div key={service.id} className="relative aspect-square group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <Image
                      src={`/images/${service.images[0]}`}
                      alt={`${service.name} work`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {services.map((service) => (
            <TabsContent key={service.id} value={service.id} className="xs:mt-[55%] lg:mt-[2%]">
              <ImageGrid images={service.images} serviceName={service.name} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  )
}
