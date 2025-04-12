import axios from 'axios';

// Initialize Pushover notification service
export const sendPushNotification = async (bookingDetails: any) => {
  try {
    const message = {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      title: 'New Appointment Booked',
      message: `New appointment for ${bookingDetails.service} on ${bookingDetails.date} at ${bookingDetails.time}\nCustomer: ${bookingDetails.customer.name}`,
      device: process.env.PUSHOVER_DEVICE_NAME,
      priority: 0,
      sound: 'pushover'
    };

    const response = await axios.post('https://api.pushover.net/1/messages.json', message);
    return response.data.status === 1;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
