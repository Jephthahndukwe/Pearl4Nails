import axios from 'axios';

/**
 * Send push notification for appointment bookings
 */
export const sendPushNotification = async (bookingDetails: any) => {
  try {
    // Create message object with proper type definition
    const message: {
      token: string | undefined;
      user: string | undefined;
      device: string | undefined;
      priority: number;
      sound: string;
      title: string;
      message: string;
    } = {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      device: process.env.PUSHOVER_DEVICE_NAME,
      priority: 0,
      sound: 'pushover',
      title: '',
      message: ''
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
};

/**
 * Send push notification for training registrations
 */
export const sendTrainingPushNotification = async (registration: any) => {
  try {
    // Create message object with proper type definition
    const message: {
      token: string | undefined;
      user: string | undefined;
      device: string | undefined;
      priority: number;
      sound: string;
      title: string;
      message: string;
    } = {
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      device: process.env.PUSHOVER_DEVICE_NAME,
      priority: 0,
      sound: 'pushover',
      title: 'New Training Registration',
      message: `New registration for ${registration.course} training\nStudent: ${registration.fullName}\nEmail: ${registration.email}\nPhone: ${registration.phoneNumber}`
    };

    const response = await axios.post('https://api.pushover.net/1/messages.json', message);
    return response.data.status === 1;
  } catch (error) {
    console.error('Error sending training push notification:', error);
    return false;
  }
};
