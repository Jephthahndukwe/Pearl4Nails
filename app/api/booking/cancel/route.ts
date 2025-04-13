import { NextResponse } from 'next/server';
import { getAppointment } from '@/app/api/services/appointment';
import { cancelAppointment } from '@/app/api/services/appointment';
import { sendCancellationEmail } from '@/app/api/services/email';

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { 
          error: 'Appointment ID is required'
        },
        { status: 400 }
      );
    }

    // Cancel the appointment
    const result = await cancelAppointment(appointmentId);

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
