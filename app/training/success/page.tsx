import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function SuccessPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle2 className="mx-auto h-20 w-20 text-pink-500" />
        </div>
        <h1 className="text-4xl font-bold text-pink-500 mb-4">Application Submitted!</h1>
        <p className="text-xl text-gray-700 mb-8">
          Thank you for your interest in our training programs. We have received your application and will be in touch with
          you shortly to discuss next steps.
        </p>
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            In the meantime, you can:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Prepare any additional documents you might need</li>
            <li>Review our training schedule and requirements</li>
            <li>Get ready for your interview if applicable</li>
          </ul>
        </div>
        <div className="space-y-4">
          <Link href="/training" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            View Training Programs
          </Link>
          <Link href="/contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  )
}
