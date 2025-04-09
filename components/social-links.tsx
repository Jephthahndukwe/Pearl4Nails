import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"
import TiktokIcon from "./tiktok-icon"

interface SocialLinksProps {
  size?: "sm" | "md" | "lg"
}

export default function SocialLinks({ size = "md" }: SocialLinksProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="https://instagram.com/pearl4nails"
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors`}
      >
        <Instagram size={iconSize[size]} />
        <span className="sr-only">Instagram</span>
      </Link>

      <Link
        href="https://wa.me/09160763206"
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors`}
      >
        <MessageCircle size={iconSize[size]} />
        <span className="sr-only">WhatsApp</span>
      </Link>

      <Link
        href="https://tiktok.com/@pearl_4_nails"
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors`}
      >
        <TiktokIcon size={iconSize[size]} />
        <span className="sr-only">TikTok</span>
      </Link>
    </div>
  )
}

