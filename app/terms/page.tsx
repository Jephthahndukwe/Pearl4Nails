import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">Terms and Conditions</h1>
        <div className="w-16 h-1 bg-pink-500 mx-auto mb-10"></div>
        
        <div className="prose max-w-none">
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-sm text-gray-500 mb-2">Last Updated: April 17, 2025</p>
            <p className="text-gray-700">
              Welcome to Pearl4nails. Please read these Terms and Conditions carefully before registering 
              for any of our training programs. By registering, you agree to comply with and be bound by these Terms.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Training Registration and Confirmation</h2>
            <p className="mb-3">
              1.1. All training program registrations are subject to availability and confirmation from Pearl4nails.
            </p>
            <p className="mb-3">
              1.2. Upon submitting your registration, you will receive a confirmation email and WhatsApp message with details
              of your training program, including the course selected, duration, equipment options, and total price.
            </p>
            <p className="mb-3">
              1.3. Registration is not considered complete until a 50% deposit has been received and confirmed by Pearl4nails.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Payment Terms</h2>
            <p className="mb-3">
              2.1. A 50% deposit of the total training fee is required to secure your place in any training program.
            </p>
            <p className="mb-3">
              2.2. Deposit payments must be made within 48 hours of registration to secure your spot in the program.
            </p>
            <p className="mb-3">
              2.3. The remaining balance must be paid in full before or on the first day of the training program.
            </p>
            <p className="mb-3">
              2.4. All payments are to be made via the payment details provided in your confirmation email.
            </p>
            <p className="mb-3">
              2.5. Prices are subject to change, but once you have paid your deposit, the price of your training program will not increase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Cancellation and Refund Policy</h2>
            <p className="mb-3">
              3.1. Cancellations made more than 14 days before the training start date will receive a full refund of any deposit paid.
            </p>
            <p className="mb-3">
              3.2. Cancellations made 7-14 days before the training start date will receive a 50% refund of any deposit paid.
            </p>
            <p className="mb-3">
              3.3. Cancellations made less than 7 days before the training start date will not be eligible for a refund.
            </p>
            <p className="mb-3">
              3.4. Pearl4nails reserves the right to cancel or reschedule training programs. In such cases, you will be offered 
              either a full refund or the option to transfer to another available training date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Training Equipment and Materials</h2>
            <p className="mb-3">
              4.1. The pricing options for each training program reflect whether equipment is provided by Pearl4nails or brought by the student.
            </p>
            <p className="mb-3">
              4.2. If you select the option to bring your own equipment, you are responsible for ensuring that all required 
              equipment is available for your training. A list of required equipment will be provided after registration.
            </p>
            <p className="mb-3">
              4.3. Equipment provided by Pearl4nails for training programs remains the property of Pearl4nails unless explicitly 
              stated that it is included in the training fee.
            </p>
            <p className="mb-3">
              4.4. Training materials provided during the course are for personal use only and may not be reproduced, 
              distributed, or used for commercial purposes without explicit permission from Pearl4nails.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Attendance and Certification</h2>
            <p className="mb-3">
              5.1. Students are expected to attend all scheduled training sessions. Missed sessions will not be rescheduled 
              or refunded unless prior arrangements have been made with Pearl4nails.
            </p>
            <p className="mb-3">
              5.2. Certification will only be provided upon successful completion of the full training program, including 
              any required assessments or demonstrations of skill.
            </p>
            <p className="mb-3">
              5.3. Pearl4nails reserves the right to withhold certification if a student does not meet the required standards of the program.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Health and Safety</h2>
            <p className="mb-3">
              6.1. Students must disclose any relevant health conditions or allergies that may affect their participation in training programs.
            </p>
            <p className="mb-3">
              6.2. Pearl4nails reserves the right to refuse training to anyone who appears to be under the influence of alcohol 
              or drugs, or whose behavior may pose a risk to themselves or others.
            </p>
            <p className="mb-3">
              6.3. Students must follow all health and safety guidelines provided during training.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Intellectual Property</h2>
            <p className="mb-3">
              7.1. All training materials, techniques, and methodologies taught during Pearl4nails training programs are the 
              intellectual property of Pearl4nails.
            </p>
            <p className="mb-3">
              7.2. Students are permitted to use the techniques learned for their personal practice and commercial application, 
              but may not teach these techniques to others in a formal training capacity without prior written agreement from Pearl4nails.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Photography and Marketing</h2>
            <p className="mb-3">
              8.1. Pearl4nails may take photographs or videos during training sessions for educational or marketing purposes.
            </p>
            <p className="mb-3">
              8.2. By participating in a training program, you grant Pearl4nails permission to use photographs or videos 
              that may include your work or likeness for promotional purposes, unless you explicitly opt out in writing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Liability</h2>
            <p className="mb-3">
              9.1. Pearl4nails is not liable for any personal injury or damage to property that occurs during training programs, 
              except where caused by proven negligence of Pearl4nails staff.
            </p>
            <p className="mb-3">
              9.2. Students are responsible for their own actions and for applying techniques safely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Amendments to Terms</h2>
            <p className="mb-3">
              10.1. Pearl4nails reserves the right to amend these Terms and Conditions at any time. Changes will be effective immediately upon posting.
            </p>
            <p className="mb-3">
              10.2. It is the responsibility of the student to review the Terms and Conditions periodically.
            </p>
          </section>

          <div className="bg-pink-50 p-6 rounded-lg border border-pink-100 mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Contact Information</h3>
            <p className="mb-3">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <p>Pearl4nails</p>
            <p>Iyana Ejigbo round at Munchiba tech, Lagos, Nigeria</p>
            <p>15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria</p>
            <p>Phone: 09160763206</p>
            <p>Email: pearl4nails@gmail.com</p>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/training" 
              className="inline-block px-6 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
            >
              Return to Training Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
