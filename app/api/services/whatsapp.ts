import axios from "axios"

/**
 * Send WhatsApp notification for appointment bookings
 */
export const sendWhatsAppNotification = async (bookingDetails: any) => {
  try {
    // Function to add field if it exists
    const addFieldIfExists = (field: string, label: string, value: any) => {
      return value ? `\n${label}: ${value}` : ""
    }

    // Build optional fields section
    let optionalFields = ""

    // Add customer notes if provided
    const customerNotes = bookingDetails.customer?.notes || bookingDetails.notes
    optionalFields += addFieldIfExists("notes", "Special Notes", customerNotes)

    // Add reference image as a link if uploaded
    if (bookingDetails.referenceImage) {
      // Don't send base64 data - instead, provide a link to view the image
      // Check for appointmentId in different formats (_id from MongoDB or appointmentId property)
      let appointmentId = bookingDetails._id || bookingDetails.appointmentId

      // Convert ObjectId to string if needed
      if (appointmentId && typeof appointmentId === "object" && appointmentId.toString) {
        appointmentId = appointmentId.toString()
      }

      if (appointmentId) {
        const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/images/${appointmentId}`
        optionalFields += `\nReference Image: ${imageUrl}`
      } else {
        optionalFields += `\nReference Image: Uploaded ✓`
      }
    }

    // Add nail shape if provided (for nails service)
    if (bookingDetails.nailShape) {
      optionalFields += addFieldIfExists("nailShape", "Nail Shape", bookingDetails.nailShape)
    }

    if (bookingDetails.nailDesign) {
      optionalFields += addFieldIfExists("nailDesign", "Nail Design", bookingDetails.nailDesign)
    }

    // Add tattoo details if provided (for tattoo service)
    if (bookingDetails.tattooLocation) {
      optionalFields += addFieldIfExists("tattooLocation", "Tattoo Location", bookingDetails.tattooLocation)
    }

    if (bookingDetails.tattooSize) {
      optionalFields += addFieldIfExists("tattooSize", "Tattoo Size", bookingDetails.tattooSize)
    }

    // If no optional fields were provided
    if (!optionalFields) {
      optionalFields = "\nNo additional details provided"
    }

    // Get customer info from either customer object or direct properties
    const customerName = bookingDetails.customer?.name || bookingDetails.name || "Customer"
    const customerEmail = bookingDetails.customer?.email || bookingDetails.email || ""
    const customerPhone = bookingDetails.customer?.phone || bookingDetails.phone || ""

    // Format services information
    let servicesInfo = ""
    let priceDisplay = ""
    let durationDisplay = ""

    if (bookingDetails.services && bookingDetails.services.length > 0) {
      // Multiple services
      servicesInfo = bookingDetails.services
        .map((service: any, index: number) => {
          let serviceText = `${index + 1}. ${service.serviceName} - ${service.serviceTypeName}`
          if (service.serviceDuration) {
            serviceText += ` (${service.serviceDuration})`
          }
          if (service.servicePrice) {
            serviceText += ` - ${service.servicePrice}`
          }
          return serviceText
        })
        .join("\n")

      // Add total duration if available
      durationDisplay = bookingDetails.totalDuration ? `\nTotal Duration: ${bookingDetails.totalDuration}` : ""
    } else {
      // Single service (legacy format)
      const serviceDisplay =
        bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service || "Service"
      servicesInfo = serviceDisplay
      priceDisplay = bookingDetails.servicePrice ? `\nPrice: ${bookingDetails.servicePrice}` : ""
      durationDisplay = bookingDetails.serviceDuration ? `\nDuration: ${bookingDetails.serviceDuration}` : ""
    }

    const message =
      bookingDetails.status === "cancelled"
        ? `Appointment Cancelled!
\n\nServices:\n${servicesInfo}${priceDisplay}${durationDisplay}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail}\nLocation: ${bookingDetails.location}${optionalFields}`
        : `New Appointment Booked!\n\nServices:\n${servicesInfo}${priceDisplay}${durationDisplay}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail}\nLocation: ${bookingDetails.location}${optionalFields}`

    // First try: CallMeBot API
    try {
      const response = await axios.get("https://api.callmebot.com/whatsapp.php", {
        params: {
          phone: process.env.WHATSAPP_PHONE_NUMBER,
          message: message,
          apikey: process.env.CALLMEBOT_API_KEY,
        },
        timeout: 10000, // 10 second timeout
        timeoutErrorMessage: 'CallMeBot API request timed out',
      })

      console.log("CallMeBot API response:", response.data)
      
      if (response.data === "OK") {
        return true
      }
      console.warn('CallMeBot API returned non-OK response:', response.data)
    } catch (error: any) {
      console.error('CallMeBot API error:', {
        code: error.code,
        message: error.message,
        response: error.response?.data
      })
    }

    // Fallback: Log to console if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Would send WhatsApp message (in production):', message)
      return true
    }

    return false
  } catch (error: any) {
    console.error('Unexpected error in WhatsApp notification:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    return false
  }
}

/**
 * Send WhatsApp notification for training registrations
 */
export const sendTrainingWhatsAppNotification = async (registration: any) => {
  try {
    // Function to add field if it exists
    const addFieldIfExists = (field: string, label: string, value: any) => {
      return value ? `\n${label}: ${value}` : ""
    }

    // Build optional fields section
    let optionalFields = ""

    // Add previous experience if provided
    optionalFields += addFieldIfExists("previousExperience", "Previous Experience", registration.previousExperience)

    // Add additional message if provided
    optionalFields += addFieldIfExists("message", "Additional Message", registration.message)

    // If no optional fields were provided
    if (!optionalFields) {
      optionalFields = "\nNo additional details provided"
    }

    const message = `New Training Registration!

Course: ${registration.course}
Duration: ${registration.duration}
Equipment: ${registration.equipment}
Price: ${registration.price}
Date: ${registration.date}
Student: ${registration.fullName}
Phone: ${registration.phoneNumber}
Email: ${registration.email}${optionalFields}`

    // Using the original 'message' parameter for proper formatting
    const response = await axios.get("https://api.callmebot.com/whatsapp.php", {
      params: {
        phone: process.env.WHATSAPP_PHONE_NUMBER,
        message: message,
        apikey: process.env.CALLMEBOT_API_KEY,
      },
    })

    return response.data === "OK"
  } catch (error) {
    console.error("Error sending WhatsApp message for training:", error)
    return false
  }
}

// Add API route handler for WhatsApp notification service
export async function POST(req: Request) {
  try {
    const appointment = await req.json()
    const result = await sendWhatsAppNotification(appointment)
    return new Response(JSON.stringify({ success: result }), {
      headers: { "Content-Type": "application/json" },
      status: result ? 200 : 500,
    })
  } catch (error) {
    console.error("Error in WhatsApp notification service API:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
