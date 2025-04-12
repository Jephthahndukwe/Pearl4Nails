import Image from "next/image"

export default function WhatsAppQR() {
  return (
    <div className="flex flex-col items-center">
      <div className="border border-gray-200 rounded-lg bg-white shadow-md">
        <Image
          src="/images/Whatsapp_qrcode.png?height=150&width=150&text=WhatsApp+QR"
          alt="WhatsApp QR Code"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">Scan to chat on WhatsApp</p>
    </div>
  )
}

