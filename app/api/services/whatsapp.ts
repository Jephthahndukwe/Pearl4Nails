import axios from 'axios';

export const sendWhatsAppNotification = async (bookingDetails: any) => {
  try {
    const message = bookingDetails.status === 'cancelled'
      ? `Appointment Cancelled!
\n\nService: ${bookingDetails.service}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nCustomer: ${bookingDetails.customer.name}\nPhone: ${bookingDetails.customer.phone}`
      : `New Appointment Booked!\n\nService: ${bookingDetails.service}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nCustomer: ${bookingDetails.customer.name}\nPhone: ${bookingDetails.customer.phone}`;

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
