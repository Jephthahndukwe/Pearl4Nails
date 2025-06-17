import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendAppointmentConfirmation } from '../../services/email';
import { sendPushNotification } from '../../services/fcm';
import { sendWhatsAppNotification } from '../../services/whatsapp';
import { sendOwnerAppointmentNotification } from '../../services/owner-email';
import { getAppointmentCollection } from '@/app/lib/mongodb';
import { clearTimeSlotCache } from '../../services/appointment';
// import { convertAppointmentToGoogleEvent, createCalendarEvent } from '../../services/google-calendar';

export async function POST(req: NextRequest) {
  try {
    const appointmentData = await req.json();

    if (!appointmentData) {
      return new NextResponse("No appointment data provided", { status: 400 });
    }

    const appointmentId = uuidv4();
    const appointmentDate = new Date(appointmentData.date);

    // Format the date into various formats for searching and display
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');
    
    const dateFormats = {
      YYYYMMDD: `${year}${month}${day}`, // YYYYMMDD
      MMDDYYYY: `${month}${day}${year}`, // MMDDYYYY
      DDMMYYYY: `${day}${month}${year}`, // DDMMYYYY
    };
    
    console.log('Formatted dates:', {
      year,
      month,
      day,
      dateFormats,
      isoString: appointmentDate.toISOString(),
      localString: appointmentDate.toString()
    });

    const formattedDate = `${String(appointmentDate.getMonth() + 1).padStart(2, '0')}/${String(appointmentDate.getDate()).padStart(2, '0')}/${appointmentDate.getFullYear()}`;

    // Format the appointment data for storage and notifications
    const appointment = {
      ...appointmentData,
      appointmentId,
      // Map services to the format expected by notification services
      services: appointmentData.services ? appointmentData.services.map((service: any) => ({
        serviceName: service.name,
        serviceTypeName: service.typeName,
        servicePrice: service.price,
        serviceDuration: service.duration,
        // Keep original properties for compatibility
        ...service
      })) : [],
      totalDuration: appointmentData.totalDuration || "",
      date: formattedDate, // Primary date format (MM/DD/YYYY)
      dateFormats: dateFormats, // Store all formats to ensure we can find it later
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      // Add raw date for debugging
      rawDate: appointmentData.date,
      rawTime: appointmentData.time,
      rawServices: appointmentData.services,
      rawTotalDuration: appointmentData.totalDuration
    };

    console.log('Saving appointment to database:', JSON.stringify({
      date: formattedDate,
      time: appointmentData.time,
      dateFormats,
      services: appointmentData.services,
      totalDuration: appointmentData.totalDuration,
      rawDate: appointmentData.date,
      rawTime: appointmentData.time
    }, null, 2));

    // Save to MongoDB
    try {
      const collection = await getAppointmentCollection();
      if (!collection) {
        console.error('Failed to connect to MongoDB collection');
        return new NextResponse('Database connection error', { status: 500 });
      }

      const result = await collection.insertOne(appointment);
      console.log('Appointment saved to MongoDB:', result.insertedId);
      
      // Clear the time slot cache for this date to ensure availability is updated
      clearTimeSlotCache(formattedDate);
    } catch (dbError) {
      console.error('Failed to save appointment to database:', dbError);
      return new NextResponse('Failed to save appointment', { status: 500 });
    }

    // Send all notifications in parallel
    try {
      // // Convert appointment to Google Calendar event
      // const googleEvent = convertAppointmentToGoogleEvent(appointment);
      
      // // Google Calendar configuration from environment variables
      // const googleConfig = {
      //   clientEmail: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL || '',
      //   privateKey: process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      //   calendarId: process.env.GOOGLE_CALENDAR_ID || ''
      // };

      // Send all notifications in parallel
      await Promise.all([
        // Add to Google Calendar
        // createCalendarEvent(googleEvent, googleConfig).then(event => {
        //   console.log('Google Calendar event created:', event.htmlLink || 'Success');
        //   return event;
        // }).catch(error => {
        //   console.error('Failed to create Google Calendar event:', error.message);
        //   throw error;
        // }),
        
        // Send confirmation email to client
        sendAppointmentConfirmation(appointment).catch(error => 
          console.error("Failed to send confirmation email:", error)
        ),
        
        // Send notification to owner
        sendOwnerAppointmentNotification(appointment).catch(error =>
          console.error("Failed to send owner notification:", error)
        ),
        
        // Send push notification via Pushover
        sendPushNotification(appointment).then(result => 
          console.log('Push notification sent:', result ? 'Success' : 'Failed')
        ).catch(error => 
          console.error("Failed to send push notification:", error)
        ),
        
        // Send WhatsApp notification via CallMeBot
        sendWhatsAppNotification(appointment).then(result =>
          console.log('WhatsApp notification sent:', result ? 'Success' : 'Failed')
        ).catch(error =>
          console.error("Failed to send WhatsApp notification:", error)
        )
      ]);
    } catch (error) {
      console.error("Error sending notifications:", error);
      // Don't fail the request if notifications fail
    }


    return NextResponse.json({ 
      success: true,
      appointmentId,
      appointment 
    }, { status: 201 });

    // Return the appointment details, including the new appointmentId
    // return NextResponse.json({ appointment }, { status: 201 });

  } catch (error) {
    console.error("Error processing appointment confirmation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}