import { NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/app/api/services/email';
import { sendPushNotification } from '@/app/api/services/fcm';
import { sendWhatsAppNotification } from '@/app/api/services/whatsapp';

export async function POST(request: Request) {
  try {
    const bookingDetails = await request.json();

    // Send email confirmation to customer
    const emailSent = await sendBookingConfirmationEmail(bookingDetails);
    if (!emailSent) {
      console.error('Failed to send email confirmation');
    }

    // Send push notification to owner
    const notificationSent = await sendPushNotification(bookingDetails);
    if (!notificationSent) {
      console.error('Failed to send push notification');
    }

    // Send WhatsApp notification to owner
    const whatsappSent = await sendWhatsAppNotification(bookingDetails);
    if (!whatsappSent) {
      console.error('Failed to send WhatsApp notification');
    }

    return NextResponse.json({
      success: true,
      emailSent,
      notificationSent,
      whatsappSent,
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { 
        error: 'Failed to confirm booking',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
