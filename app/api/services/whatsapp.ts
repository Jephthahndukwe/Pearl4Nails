import axios from 'axios';

/**
 * Send WhatsApp notification for appointment bookings
 */
export const sendWhatsAppNotification = async (bookingDetails: any) => {
  try {
    // Function to add field if it exists
    const addFieldIfExists = (field: string, label: string, value: any) => {
      return value ? `\n${label}: ${value}` : '';
    };
    
    // Build optional fields section
    let optionalFields = '';
    
    // Add customer notes if provided
    optionalFields += addFieldIfExists('notes', 'Special Notes', bookingDetails.customer.notes);
    
    // Add reference image as a link if uploaded
    if (bookingDetails.referenceImage) {
      // Don't send base64 data - instead, provide a link to view the image
      // Check for appointmentId in different formats (_id from MongoDB or appointmentId property)
      let appointmentId = bookingDetails._id || bookingDetails.appointmentId;
      
      // Convert ObjectId to string if needed
      if (appointmentId && typeof appointmentId === 'object' && appointmentId.toString) {
        appointmentId = appointmentId.toString();
      }
      
      if (appointmentId) {
        const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/images/${appointmentId}`;
        optionalFields += `\nReference Image: ${imageUrl}`;
      } else {
        optionalFields += `\nReference Image: Uploaded ✓`;
      }
    }
    
    // Add nail shape if provided (for nails service)
    if (bookingDetails.service === 'nails') {
      optionalFields += addFieldIfExists('nailShape', 'Nail Shape', bookingDetails.nailShape);
      optionalFields += addFieldIfExists('nailDesign', 'Nail Design', bookingDetails.nailDesign);
    }
    
    // Add tattoo details if provided (for tattoo service)
    if (bookingDetails.service === 'tattoo') {
      optionalFields += addFieldIfExists('tattooLocation', 'Tattoo Location', bookingDetails.tattooLocation);
      optionalFields += addFieldIfExists('tattooSize', 'Tattoo Size', bookingDetails.tattooSize);
    }
    
    // If no optional fields were provided
    if (!optionalFields) {
      optionalFields = '\nNo additional details provided';
    }
    
    // Get service details using the new structure if available
    const serviceDisplay = bookingDetails.serviceTypeName || bookingDetails.serviceName || bookingDetails.service;
    const priceDisplay = bookingDetails.servicePrice ? `\nPrice: ${bookingDetails.servicePrice}` : '';
    const durationDisplay = bookingDetails.serviceDuration ? `\nDuration: ${bookingDetails.serviceDuration}` : '';
    
    const message = bookingDetails.status === 'cancelled'
      ? `Appointment Cancelled!
\n\nService: ${serviceDisplay}${priceDisplay}${durationDisplay}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nCustomer: ${bookingDetails.customer.name}\nPhone: ${bookingDetails.customer.phone}\nEmail: ${bookingDetails.customer.email}${optionalFields}`
      : `New Appointment Booked!\n\nService: ${serviceDisplay}${priceDisplay}${durationDisplay}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nCustomer: ${bookingDetails.customer.name}\nPhone: ${bookingDetails.customer.phone}\nEmail: ${bookingDetails.customer.email}${optionalFields}`;

    // Using the original 'message' parameter for proper formatting
    const response = await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone: process.env.WHATSAPP_PHONE_NUMBER,
        message: message,
        apikey: process.env.CALLMEBOT_API_KEY,
      },
    });

    return response.data === 'OK';
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

/**
 * Send WhatsApp notification for training registrations
 */
export const sendTrainingWhatsAppNotification = async (registration: any) => {
  try {
    // Function to add field if it exists
    const addFieldIfExists = (field: string, label: string, value: any) => {
      return value ? `\n${label}: ${value}` : '';
    };
    
    // Build optional fields section
    let optionalFields = '';
    
    // Add previous experience if provided
    optionalFields += addFieldIfExists('previousExperience', 'Previous Experience', registration.previousExperience);
    
    // Add additional message if provided
    optionalFields += addFieldIfExists('message', 'Additional Message', registration.message);
    
    // If no optional fields were provided
    if (!optionalFields) {
      optionalFields = '\nNo additional details provided';
    }
    
    const message = `New Training Registration!\n\nCourse: ${registration.course}\nDate: ${registration.date}\nStudent: ${registration.fullName}\nPhone: ${registration.phoneNumber}\nEmail: ${registration.email}${optionalFields}`;

    // Using the original 'message' parameter for proper formatting
    const response = await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone: process.env.WHATSAPP_PHONE_NUMBER,
        message: message,
        apikey: process.env.CALLMEBOT_API_KEY,
      }
    });

    return response.data === 'OK';
  } catch (error) {
    console.error('Error sending WhatsApp message for training:', error);
    return false;
  }
};
