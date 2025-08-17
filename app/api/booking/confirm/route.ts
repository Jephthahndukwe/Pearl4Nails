import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendAppointmentConfirmation } from '../../services/email';
import { sendPushNotification } from '../../services/fcm';
import { sendWhatsAppNotification } from '../../services/whatsapp';
import { sendOwnerAppointmentNotification } from '../../services/owner-email';
import { getAppointmentCollection } from '@/app/lib/mongodb';
import { findServiceTypeById } from '@/types/service';
import { clearTimeSlotCache } from '../../services/appointment';

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

    // Parse total price from the request if available
    let totalPrice = { min: 0, max: 0 };
    if (appointmentData.totalPrice) {
      try {
        // Handle both stringified and direct object formats
        const priceData = typeof appointmentData.totalPrice === 'string' 
          ? JSON.parse(appointmentData.totalPrice)
          : appointmentData.totalPrice;
        
        if (priceData && (priceData.min !== undefined || priceData.max !== undefined)) {
          totalPrice = {
            min: Number(priceData.min) || 0,
            max: Number(priceData.max) || 0
          };
        }
      } catch (error) {
        console.error('Error parsing total price:', error);
      }
    }

    // Format the appointment data for storage and notifications
    const appointment = {
      ...appointmentData,
      appointmentId,
      // Map services to the format expected by notification services
      services: appointmentData.services ? appointmentData.services.flatMap((service: any) => {
        const serviceTypes = Array.isArray(service.typeId) 
          ? service.typeId.map((typeId: string) => findServiceTypeById(service.id, typeId))
          : [findServiceTypeById(service.id, service.typeId)];

        return serviceTypes.map((serviceType: any) => ({
          serviceName: service.name,
          serviceTypeName: serviceType?.name || service.typeName,
          servicePrice: serviceType?.price || service.price,
          serviceDuration: serviceType?.duration || service.duration,
          // Keep original properties for compatibility
          ...service
        }));
      }) : [],
      totalDuration: appointmentData.totalDuration || "",
      totalPrice, // Include the parsed total price
      date: formattedDate, // Primary date format (MM/DD/YYYY)
      dateFormats: dateFormats, // Store all formats to ensure we can find it later
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      // Include reference image if provided
      referenceImage: appointmentData.referenceImage || null,
      // Add nail shape and design if provided
      nailShape: appointmentData.nailShape || null,
      nailDesign: appointmentData.nailDesign || null,
      // Add raw date for debugging
      rawDate: appointmentData.date,
      rawTime: appointmentData.time,
      rawServices: appointmentData.services,
      rawTotalDuration: appointmentData.totalDuration,
      rawTotalPrice: appointmentData.totalPrice // Keep original for debugging
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
      await Promise.all([
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