import Image from "next/image"
import { nailImages, lashImages, microbladingImages, makeupImages, 
         manicureImages, piercingImages, toothGemsImages, browImages, 
         hairImages, tattooImages } from "./images"

interface ImageGridProps {
  images: string[]
  serviceName: string
  onImageClick?: (image: string, serviceName: string) => void
}

export function ImageGrid({ images, serviceName, onImageClick }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image, i) => (
        <div key={i} className="relative aspect-square group" onClick={() => onImageClick?.(image, serviceName)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src={`/images/${image}`}
              alt={`${serviceName} ${i + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="font-semibold">{serviceName} {i + 1}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}
