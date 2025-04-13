import axios from 'axios';

// Initialize Pushover notification service
export const sendPushNotification = async (bookingDetails: any) => {
  try {
    const message = {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      device: process.env.PUSHOVER_DEVICE_NAME,
      priority: 0,
      sound: 'pushover'
    };

    // Set message based on appointment status
    if (bookingDetails.status === 'cancelled') {
      message.title = 'Appointment Cancelled';
      message.message = `Appointment for ${bookingDetails.service} on ${bookingDetails.date} at ${bookingDetails.time} has been cancelled\nCustomer: ${bookingDetails.customer.name}`;
    } else {
      message.title = 'New Appointment Booked';
      message.message = `New appointment for ${bookingDetails.service} on ${bookingDetails.date} at ${bookingDetails.time}\nCustomer: ${bookingDetails.customer.name}`;
    }

    const response = await axios.post('https://api.pushover.net/1/messages.json', message);
    return response.data.status === 1;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};0
