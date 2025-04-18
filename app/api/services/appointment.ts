import { ObjectId } from 'mongodb';
import { getAppointmentCollection } from '@/app/lib/mongodb';
import { Appointment } from '@/types/appointment';
import { sendPushNotification } from './fcm';
import { sendWhatsAppNotification } from './whatsapp';
import { sendAppointmentConfirmation, sendCancellationNotification } from './email';

export async function createAppointment(appointmentData: any): Promise<any> {
  try {
    const collection = await getAppointmentCollection();
    
    // Format the date as MM/DD/YYYY
    const dateObj = new Date(appointmentData.date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    
    console.log('Original date:', appointmentData.date);
    console.log('Formatted date:', formattedDate);
    
    // Store multiple date formats to ensure compatibility between environments
    const dateFormats = {
      standard: formattedDate,                           // MM/DD/YYYY
      iso: dateObj.toISOString().split('T')[0],         // YYYY-MM-DD
      dash: `${month}-${day}-${year}`,                  // MM-DD-YYYY
      ymd: `${year}-${month}-${day}`                    // YYYY-MM-DD (alt format)
    };

    // Create the appointment with multiple date formats for cross-environment compatibility
    const appointment = {
      ...appointmentData,
      date: formattedDate,              // Primary date format (MM/DD/YYYY)
      dateFormats: dateFormats,         // Store all formats to ensure we can find it later
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    };

    // Insert the appointment
    const result = await collection.insertOne(appointment);
    
    // Add the MongoDB ID to the appointment
    appointment._id = result.insertedId.toString();
    
    console.log('Appointment created successfully:', appointment);

    // Send notifications with proper date formatting
    const notificationDate = new Date(formattedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const notificationTime = appointmentData.time;

    // Send notifications
    await sendAppointmentConfirmation({
      ...appointment,
      date: notificationDate,
      time: notificationTime
    });
    const notificationSent = await sendPushNotification({
      ...appointment,
      date: notificationDate,
      time: notificationTime
    });
    const whatsappSent = await sendWhatsAppNotification({
      ...appointment,
      date: notificationDate,
      time: notificationTime
    });

    return {
      success: true,
      appointmentId: appointment._id,
      appointment,
      notificationSent,
      whatsappSent
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId: string) => {
  try {
    const collection = await getAppointmentCollection();
    
    // First check if the appointment exists
    const existingAppointment = await collection.findOne({ _id: new ObjectId(appointmentId) });
    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    // Update appointment status to cancelled
    const result = await collection.updateOne(
      { _id: new ObjectId(appointmentId) },
      {
        $set: {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Failed to cancel appointment');
    }

    // Get the updated appointment details for notifications
    const appointment = await collection.findOne({ _id: new ObjectId(appointmentId) });
    
    // Send cancellation notifications
    await sendCancellationNotification(appointment as any);
    const notificationSent = await sendPushNotification({
      ...appointment,
      status: 'cancelled'
    });

    const whatsappSent = await sendWhatsAppNotification({
      ...appointment,
      status: 'cancelled'
    });

    // Redirect to cancelled page
    return {
      success: true,
      notificationSent,
      whatsappSent,
      redirectUrl: `/booking/cancelled?appointmentId=${appointmentId}&status=cancelled`
    };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Simple in-memory cache for time slot data
interface TimeSlotCache {
  [key: string]: {
    data: { time: string; isAvailable: boolean }[];
    timestamp: number;
  };
}

// Cache will expire after 5 minutes (300000 ms)
const CACHE_TTL = 300000;
const timeSlotCache: TimeSlotCache = {};

export async function getAvailableTimeSlots(searchDate: string): Promise<{ time: string; isAvailable: boolean }[]> {
  try {
    // Parse the search date into day/month/year
    const dateParamObj = new Date(searchDate);
    if (isNaN(dateParamObj.getTime())) {
      throw new Error(`Invalid date format: ${searchDate}`);
    }
    
    const day = String(dateParamObj.getDate()).padStart(2, '0');
    const month = String(dateParamObj.getMonth() + 1).padStart(2, '0');
    const year = dateParamObj.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    
    // Check if we have valid cached data
    const cacheKey = `timeslots_${formattedDate}`;
    const now = Date.now();
    const cachedData = timeSlotCache[cacheKey];
    
    if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
      console.log('Returning cached time slots for date:', formattedDate);
      return cachedData.data;
    }
    
    console.log(`Fetching appointments for date: ${formattedDate}`);
    
    console.log(`Connecting to MongoDB for date: ${formattedDate}`);
    
    // Connect to MongoDB and get the collection
    const collection = await getAppointmentCollection();
    
    if (!collection) {
      throw new Error('Failed to get appointment collection');
    }
    
    console.log('Successfully connected to MongoDB');
    
    // Create different possible date formats to query with
    const possibleDateFormats = [
      formattedDate,                             // MM/DD/YYYY
      `${month}-${day}-${year}`,                // MM-DD-YYYY
      `${year}-${month}-${day}`,                // YYYY-MM-DD
      dateParamObj.toISOString().split('T')[0], // YYYY-MM-DD ISO format
      new Date(dateParamObj).toLocaleDateString('en-US') // Locale-specific format
    ];
    
    console.log(`Searching with date formats:`, possibleDateFormats);
    
    // Build a comprehensive query that checks all possible date locations
    const bookedAppointments = await collection.find({
      $or: [
        // Check the primary date field
        { date: { $in: possibleDateFormats } },
        
        // Check inside dateFormats structure (for newer appointments)
        { 'dateFormats.standard': formattedDate },
        { 'dateFormats.iso': dateParamObj.toISOString().split('T')[0] },
        { 'dateFormats.dash': `${month}-${day}-${year}` },
        { 'dateFormats.ymd': `${year}-${month}-${day}` },
        
        // If the date is stored as a Date object in MongoDB
        { date: { $gte: new Date(new Date(formattedDate).setHours(0,0,0,0)), 
                 $lt: new Date(new Date(formattedDate).setHours(23,59,59,999)) } }
      ],
      status: { $in: ['confirmed', 'pending'] }
    }).toArray();

    console.log(`[${process.env.NODE_ENV}] Booked appointments found:`, bookedAppointments.length);
    console.log('Booked appointment times:', bookedAppointments.map((appointment: any) => appointment.time));

    // Get all possible time slots (9am to 8pm)
    const allTimeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    // Create array of available time slots
    const availableTimeSlots = allTimeSlots.map(time => ({
      time,
      isAvailable: !bookedAppointments.some(appointment => appointment.time === time)
    }));

    // Store result in cache
    timeSlotCache[cacheKey] = {
      data: availableTimeSlots,
      timestamp: now
    };

    return availableTimeSlots;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[${process.env.NODE_ENV}] Error getting available time slots:`, err);
    // Add specific error detection for Netlify
    if (process.env.NODE_ENV === 'production') {
      console.error('Production environment detected, detailed error info:', {
        errorName: err.name,
        errorMessage: err.message,
        stack: err.stack,
      });
    }
    throw error;
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const collection = await getAppointmentCollection();
    const appointment = await collection.findOne({ _id: new ObjectId(appointmentId) });
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

export async function deleteAppointment(appointmentId: string): Promise<Appointment> {
  try {
    const collection = await getAppointmentCollection();
    
    // First get the appointment details
    const appointment = await collection.findOne({ _id: new ObjectId(appointmentId) });
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Delete the appointment
    const result = await collection.deleteOne({ _id: new ObjectId(appointmentId) });
    
    if (result.deletedCount === 0) {
      throw new Error('Failed to delete appointment');
    }

    console.log('Appointment deleted successfully:', appointmentId);
    return appointment;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};
