import axios from "axios"

/**
 * Send push notification for appointment bookings
 */
export const sendPushNotification = async (bookingDetails: any) => {
  try {
    // Create message object with proper type definition
    const message: {
      token: string | undefined
      user: string | undefined
      device: string | undefined
      priority: number
      sound: string
      title: string
      message: string
    } = {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      device: process.env.PUSHOVER_DEVICE_NAME,
      priority: 0,
      sound: "pushover",
      title: "",
      message: "",
    }

    // Format services information
    let servicesInfo = ""
    if (bookingDetails.services && bookingDetails.services.length > 0) {
      servicesInfo = bookingDetails.services
        .map(
          (service: any, index: number) =>
            `${index + 1}. ${service.serviceName} - ${service.serviceTypeName}${service.serviceDuration ? ` (${service.serviceDuration})` : ""}`,
        )
        .join("\n")

      if (bookingDetails.totalDuration) {
        servicesInfo += `\n\nTotal Duration: ${bookingDetails.totalDuration}`
      }
    } else {
      // Single service (legacy format)
      const serviceName =
        bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service || "Service"
      const serviceDuration = bookingDetails.serviceDuration ? ` (${bookingDetails.serviceDuration})` : ""
      servicesInfo = `${serviceName}${serviceDuration}`
    }

    // Get customer info from either customer object or direct properties
    const customerName = bookingDetails.customer?.name || bookingDetails.name || "Customer"
    const customerEmail = bookingDetails.customer?.email || bookingDetails.email || ""
    const customerPhone = bookingDetails.customer?.phone || bookingDetails.phone || ""

    // Set message based on appointment status
    if (bookingDetails.status === "cancelled") {
      message.title = "Appointment Cancelled"
      message.message = `Appointment for ${customerName} on ${bookingDetails.date} at ${bookingDetails.time} has been cancelled.\n\nServices:\n${servicesInfo}\n\nLocation: ${bookingDetails.location}\nPhone: ${customerPhone}\nEmail: ${customerEmail}`
    } else {
      message.title = "New Appointment Booked"
      message.message = `New appointment for ${customerName} on ${bookingDetails.date} at ${bookingDetails.time}.\n\nServices:\n${servicesInfo}\n\nLocation: ${bookingDetails.location}\nPhone: ${customerPhone}\nEmail: ${customerEmail}`
    }

    const response = await axios.post("https://api.pushover.net/1/messages.json", message, {
      timeout: 5000, // 5 second timeout
      timeoutErrorMessage: 'Pushover API request timed out',
    })
    return response.data.status === 1
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('Pushover API request timed out:', error.message)
    } else if (error.response) {
      console.error('Pushover API error response:', {
        status: error.response.status,
        data: error.response.data
      })
    } else if (error.request) {
      console.error('No response received from Pushover API:', error.request)
    } else {
      console.error('Error setting up push notification request:', error.message)
    }
    return false
  }
}

/**
 * Send push notification for training registrations
 */
export const sendTrainingPushNotification = async (registration: any) => {
  try {
    // Create message object with proper type definition
    const message: {
      token: string | undefined
      user: string | undefined
      device: string | undefined
      priority: number
      sound: string
      title: string
      message: string
    } = {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      device: process.env.PUSHOVER_DEVICE_NAME,
      priority: 0,
      sound: "pushover",
      title: "New Training Registration",
      message: `New registration for ${registration.course} training\nStudent: ${registration.fullName}\nEmail: ${registration.email}\nPhone: ${registration.phoneNumber}`,
    }

    const response = await axios.post("https://api.pushover.net/1/messages.json", message)
    return response.data.status === 1
  } catch (error) {
    console.error("Error sending training push notification:", error)
    return false
  }
}

// Add API route handler for push notification service
export async function POST(req: Request) {
  try {
    const appointment = await req.json()
    const result = await sendPushNotification(appointment)
    return new Response(JSON.stringify({ success: result }), {
      headers: { "Content-Type": "application/json" },
      status: result ? 200 : 500,
    })
  } catch (error) {
    console.error("Error in push notification service API:", error)
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
