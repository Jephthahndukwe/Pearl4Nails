import Image from "next/image"
import { Star, Heart, Award, Sparkles, ArrowRight, Calendar, Brush, Gem } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Abstract Design */}
      <section className="relative py-28 md:py-36 bg-gradient-to-r from-pink-500 to-pink-400 overflow-hidden flex items-center justify-center">
        {/* Abstract pattern elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full"></div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our <span className="text-white">Beauty</span> Story</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-white/90">
            Where passion meets artistry to create your perfect look
          </p>
        </div>
      </section>

      {/* Mission Statement Card - Overlapping with Hero */}
      <section className="relative z-20 max-w-5xl mx-auto -mt-20 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-pink-50 rounded-full">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4">Our Passion</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto">
            Pearl4nails was founded with a passion for beauty and a commitment to excellence. What started as a small
            nail service has grown into a comprehensive beauty destination offering a wide range of services to enhance
            your natural beauty.
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-gray-50 mt-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">What Defines <span className="text-pink-500">Us</span></h2>
            <div className="w-16 h-1 bg-pink-400 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">We're guided by our commitment to excellence, innovation, and your satisfaction</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-pink-50 p-3 inline-flex rounded-full mb-4">
                <Star className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To provide exceptional beauty services that enhance our clients' natural beauty and boost their confidence, using premium products and creating a welcoming environment.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-pink-50 p-3 inline-flex rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                To be a leading beauty destination known for exceptional services, innovative techniques, and sharing our knowledge through comprehensive training programs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-pink-50 p-3 inline-flex rounded-full mb-4">
                <Award className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Excellence</h3>
              <p className="text-gray-600">
                We believe in continual learning, staying updated with the latest techniques, and providing a level of service that exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Owner */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-40 h-40 bg-pink-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-pink-200 rounded-full opacity-40"></div>
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg h-[500px] w-full">
                <Image 
                  src="/images/Owner.jpg" 
                  alt="Precious Pearl Nwabueze" 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
            
            <div className="p-4">
              <h5 className="text-pink-500 font-medium mb-2">The Artist Behind Pearl4nails</h5>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Meet <span className="text-pink-500">Precious Pearl</span></h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                With years of experience in the beauty industry, Pearl brings expertise, creativity, and passion
                to every service she provides. Her journey began with a simple passion for beauty artistry, which
                she has perfected over years of dedicated practice and continual education.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center mr-3">
                    <Brush className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Certified Beauty Expert</h4>
                    <p className="text-sm text-gray-500">With multiple industry certifications</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Industry Veteran</h4>
                    <p className="text-sm text-gray-500">Years of experience perfecting her craft</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center mr-3">
                    <Gem className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Beauty Educator</h4>
                    <p className="text-sm text-gray-500">Passionate about sharing her knowledge</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Our <span className="text-pink-500">Journey</span></h2>
            <div className="w-16 h-1 bg-pink-400 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">A timeline of how Pearl4nails has evolved into the beauty destination it is today</p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-pink-200"></div>
            
            {/* Timeline items */}
            <div className="mb-12 relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-pink-500 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold shadow-md">1</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">The Beginning</h3>
                <p className="text-gray-600">
                  Pearl4nails started as a passion project focusing on nail art and design, serving a small but dedicated clientele.                  
                </p>
              </div>
            </div>
            
            <div className="mb-12 relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-pink-500 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold shadow-md">2</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Growing Our Services</h3>
                <p className="text-gray-600">
                  Expanding our offerings to include lash extensions, microblading, and other beauty services as demand grew.
                </p>
              </div>
            </div>
            
            <div className="mb-12 relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-pink-500 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold shadow-md">3</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Training Academy</h3>
                <p className="text-gray-600">
                  Launching our professional training programs to share our expertise and techniques with aspiring beauty professionals.
                </p>
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-pink-500 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold shadow-md">4</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Today & Beyond</h3>
                <p className="text-gray-600">
                  Today, Pearl4nails is a comprehensive beauty destination with plans to expand our offerings and reach even more clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Experience the Pearl4nails Difference</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join us and discover why our clients trust us with their beauty needs
          </p>
          <a href="/booking" className="inline-flex items-center bg-white text-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Book Your Appointment
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </main>
  )
}
