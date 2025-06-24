import { NextResponse } from 'next/server';
import { cancelAppointment } from '@/app/api/services/appointment';
import { sendCancellationEmail } from '@/app/api/services/email';
import { sendOwnerCancellationNotification } from '@/app/api/services/owner-email';
import { sendPushNotification } from '@/app/api/services/fcm';
import { sendWhatsAppNotification } from '@/app/api/services/whatsapp';

export async function POST(request: Request) {
  try {
    // Log the raw request body for debugging
    const requestBody = await request.text();
    console.log('Raw request body:', requestBody);
    
    let requestData;
    try {
      requestData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { appointmentId } = requestData;
    console.log('Extracted appointmentId:', appointmentId, 'Type:', typeof appointmentId);

    if (!appointmentId) {
      return NextResponse.json(
        { 
          error: 'Appointment ID is required',
          receivedData: requestData // Include received data for debugging
        },
        { status: 400 }
      );
    };

    // Cancel the appointment and get the full appointment details
    const { appointment, redirectUrl } = await cancelAppointment(appointmentId);

    // Send cancellation notifications
    try {
      // Send cancellation email
      await sendCancellationEmail(appointment);
      
      // Send owner cancellation notification
      await sendOwnerCancellationNotification(appointment);
      
      // Send FCM notification
      await sendPushNotification(appointment);
      
      // Send WhatsApp notification
      await sendWhatsAppNotification(appointment);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the cancellation if notifications fail
    }

    // Return success response with redirect URL
    return NextResponse.json({
      success: true,
      redirectUrl
    });

  } catch (error) {
    console.error('Error in cancellation:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to cancel appointment'
      },
      { status: 500 }
    );
  }
}
