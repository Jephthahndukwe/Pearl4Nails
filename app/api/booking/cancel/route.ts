import { NextResponse } from 'next/server';
import { cancelAppointment } from '@/app/api/services/appointment';
import { sendCancellationEmail } from '@/app/api/services/email';
import { sendOwnerCancellationNotification } from '@/app/api/services/owner-email';

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

    // Cancel the appointment
    const result = await cancelAppointment(appointmentId);

    // Send cancellation email
    await sendCancellationEmail(appointmentId);

    // Send owner cancellation notification email
    await sendOwnerCancellationNotification(appointmentId);

    // Redirect to cancelled page
    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl
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
