import Image from "next/image"

export default function AboutPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-12">About Pearl4nails</h1>

        <div className="mb-12">
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image src="/images/salon.jpg" alt="Pearl4nails Salon" fill className="object-cover" />
          </div>

          <h2 className="text-2xl font-bold text-pink-500 mb-4">Our Story</h2>
          <p className="text-gray-700 mb-6">
            Pearl4nails was founded with a passion for beauty and a commitment to excellence. What started as a small
            nail service has grown into a comprehensive beauty destination offering a wide range of services to enhance
            your natural beauty.
          </p>
          <p className="text-gray-700 mb-6">
            Our journey began when our founder recognized the need for high-quality, personalized beauty services that
            prioritize client satisfaction. Since then, we've been dedicated to providing exceptional services that
            leave our clients feeling confident and beautiful.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            At Pearl4nails, our mission is to provide exceptional beauty services that enhance our clients' natural
            beauty and boost their confidence. We are committed to using premium products, staying updated with the
            latest trends and techniques, and creating a welcoming environment where clients can relax and enjoy their
            beauty experience.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Our Vision</h2>
          <p className="text-gray-700 mb-6">
            We envision Pearl4nails as a leading beauty destination known for its exceptional services, innovative
            techniques, and commitment to client satisfaction. We aim to expand our reach and continue providing
            top-notch beauty services while also sharing our knowledge through comprehensive training programs.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Meet The Owner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-pink-50 rounded-xl p-6">
              <div className="relative h-80 w-full rounded-lg overflow-hidden mb-4">
                <Image src="/images/Owner.jpg" alt="Founder" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-pink-500">Precious Pearl Nwabueze</h3>
              <p className="text-gray-600">Founder & Lead Technician</p>
              <p className="text-gray-700 mt-2">
                With over 10 years of experience in the beauty industry, Pearl brings expertise, creativity, and passion
                to every service she provides.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

