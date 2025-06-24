import axios from "axios";

/**
 * Send WhatsApp notification for appointment bookings
 * Updated to use native fetch instead of axios
 */

// Global lock to prevent rapid resends (in-memory throttle)
let lastSentAt = 0;
let lastBookingId = '';

interface TrainingDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  course: 'nail-art' | 'lash-extensions' | 'microblading';
  duration: '4-weeks' | '3-months' | '6-months' | '1-week' | '2-weeks' | '3-days';
  equipmentOption: 'provided' | 'self';
}

export const sendTrainingWhatsAppNotification = async (trainingDetails: TrainingDetails) => {
  try {
    const { fullName, course, duration, equipmentOption } = trainingDetails;
    const courses = {
      'nail-art': 'Professional Nail Art',
      'lash-extensions': 'Lash Extension Mastery',
      'microblading': 'Microblading Certification'
    };
    const durations = {
      '4-weeks': '4 Weeks Course',
      '3-months': '3 Months Course',
      '6-months': '6 Months Course',
      '1-week': '1 Week Course',
      '2-weeks': '2 Weeks Course',
      '3-days': '3 Days Course'
    };
    const equipmentOptions = {
      'provided': 'Equipment Provided by Pearl4Nails',
      'self': 'Student Provides Own Equipment'
    };

    const message = `🌟 New Training Registration!

Name: ${fullName}
Course: ${courses[course as keyof typeof courses]}
Duration: ${durations[duration as keyof typeof durations]}
Equipment: ${equipmentOptions[equipmentOption as keyof typeof equipmentOptions]}

Thank you for choosing Pearl4Nails! 🌟`;

    // Send message using WhatsApp API
    // Implementation would depend on your WhatsApp API provider
    // This is a placeholder - implement actual WhatsApp API call here
    console.log('Sending WhatsApp notification:', message);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
};

export const sendWhatsAppNotification = async (bookingDetails: any) => {

  const now = Date.now();
  const currentBookingId = bookingDetails._id?.toString?.() || bookingDetails.appointmentId?.toString?.() || '';

  // 🚨 Cooldown of 15 seconds between messages
  if (currentBookingId === lastBookingId && now - lastSentAt < 15000) {
    console.warn("Throttled: WhatsApp message already sent recently for this booking.");
    return false;
  }

  lastSentAt = now;
  lastBookingId = currentBookingId;

  try {
    const addFieldIfExists = (field: string, label: string, value: any) => {
      return value ? `\n${label}: ${value}` : "";
    };

    let optionalFields = "";
    const customerNotes = bookingDetails.customer?.notes || bookingDetails.notes;
    optionalFields += addFieldIfExists("notes", "Special Notes", customerNotes);

    if (bookingDetails.referenceImage) {
      let appointmentId = bookingDetails._id || bookingDetails.appointmentId;
      if (appointmentId && typeof appointmentId === "object" && appointmentId.toString) {
        appointmentId = appointmentId.toString();
      }
      if (appointmentId) {
        const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/images/${appointmentId}`;
        optionalFields += `\nReference Image: ${imageUrl}`;
      } else {
        optionalFields += `\nReference Image: Uploaded ✓`;
      }
    }

    optionalFields += addFieldIfExists("nailShape", "Nail Shape", bookingDetails.nailShape);
    optionalFields += addFieldIfExists("nailDesign", "Nail Design", bookingDetails.nailDesign);
    optionalFields += addFieldIfExists("tattooLocation", "Tattoo Location", bookingDetails.tattooLocation);
    optionalFields += addFieldIfExists("tattooSize", "Tattoo Size", bookingDetails.tattooSize);

    if (!optionalFields) {
      optionalFields = "\nNo additional details provided";
    }

    const customerName = bookingDetails.customer?.name || bookingDetails.name || "Customer";
    const customerEmail = bookingDetails.customer?.email || bookingDetails.email || "";
    const customerPhone = bookingDetails.customer?.phone || bookingDetails.phone || "";

    let servicesInfo = "";
    let priceDisplay = "";
    let durationDisplay = "";
    let totalPriceDisplay = "";

    if (bookingDetails.services && bookingDetails.services.length > 0) {
      servicesInfo = bookingDetails.services
        .map((service: any, index: number) => {
          let serviceText = `${index + 1}. ${service.serviceName} - ${service.serviceTypeName}`;
          if (service.serviceDuration) serviceText += ` (${service.serviceDuration})`;
          if (service.servicePrice) serviceText += ` - ${service.servicePrice}`;
          return serviceText;
        })
        .join("\n");

      durationDisplay = bookingDetails.totalDuration ? `\nTotal Duration: ${bookingDetails.totalDuration}` : "";

      if (bookingDetails.totalPrice) {
        const { min, max } = bookingDetails.totalPrice;
        totalPriceDisplay = min === max
          ? `\nTotal Price: ₦${min.toLocaleString()}`
          : `\nTotal Price: ₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
      }
    } else {
      const serviceDisplay = bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service || "Service";
      servicesInfo = serviceDisplay;
      priceDisplay = bookingDetails.servicePrice ? `\nPrice: ${bookingDetails.servicePrice}` : "";
      durationDisplay = bookingDetails.serviceDuration ? `\nDuration: ${bookingDetails.serviceDuration}` : "";
    }

    // Format message with proper encoding and structure
    // Format message with all appointment details matching owner email notification
    const status = bookingDetails.status === "cancelled" ? "Appointment Cancelled!" : "New Appointment Booking!";
    const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build message using string concatenation instead of template literals
    const message = status + '\n\n' +
      'Client Information:\n' +
      'Name: ' + customerName + '\n' +
      'Email: ' + customerEmail + '\n' +
      'Phone: ' + customerPhone + '\n' +
      (bookingDetails.notes ? 'Notes: ' + bookingDetails.notes + '\n' : '') +
      // (bookingDetails.serviceNailShape ? '\nNail Shape: ' + bookingDetails.serviceNailShape + '\n' : '') +
      // (bookingDetails.serviceNailDesign ? '\nNail Design: ' + bookingDetails.serviceNailDesign + '\n' : '') +
      '\nAppointment Details:\n' +
      'Date: ' + formattedDate + '\n' +
      'Time: ' + bookingDetails.time + '\n\n' +
      'Services Booked:\n' +
      servicesInfo + priceDisplay + durationDisplay + totalPriceDisplay +
      (bookingDetails.nailShape ? '\nNail Shape: ' + bookingDetails.nailShape + '\n' : '') +
      (bookingDetails.nailDesign ? '\nNail Design: ' + bookingDetails.nailDesign + '\n' : '') +
      (bookingDetails.referenceImage ? '\nInspo Image: ' + bookingDetails.referenceImage : '')

    // Revert to using environment variables
    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!phoneNumber || !apiKey) {
      throw new Error("Missing WhatsApp number or API key in environment variables.");
    }

    // Use the message and encode it with encodeURIComponent
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Pearl4Nails/1.0',
        'Accept': 'text/plain'
      }
    });
    const text = await response.text();

    if (response.status === 200 && /OK|queued|sent/i.test(text)) {
      console.log("WhatsApp notification sent successfully");
      return true;
    } else {
      console.error("CallMeBot Error Response:", text);
      return false;
    }

  } catch (error: any) {
    console.error('Unexpected error in WhatsApp notification:', {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};
