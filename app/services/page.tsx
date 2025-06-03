import ServicesList from "@/components/services-list"

export default function ServicesPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-12">Our Services</h1>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          At Pearl4nails, we offer a comprehensive range of beauty services to enhance your natural beauty. Our skilled
          technicians use premium products to deliver stunning results that will leave you feeling confident and
          beautiful.
        </p>

        <ServicesList />
      </div>
    </main>
  )
}
