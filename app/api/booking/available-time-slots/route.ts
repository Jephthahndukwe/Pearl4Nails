import { NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/app/api/services/appointment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return new Response(JSON.stringify({ error: 'Date is required' }), {
        status: 400,
      });
    }

    // Convert ISO date to MM/DD/YYYY format with leading zeros
    const dateObj = new Date(date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    const availableTimeSlots = await getAvailableTimeSlots(formattedDate);
    return new Response(JSON.stringify({ timeSlots: availableTimeSlots }));
  } catch (error) {
    console.error('Error in available time slots API:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch available time slots' }), {
      status: 500,
    });
  }
}
