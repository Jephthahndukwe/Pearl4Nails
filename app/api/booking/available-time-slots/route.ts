import { NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/app/api/services/appointment';

// Default time slots used as fallback when MongoDB connection fails in production
const getDefaultTimeSlots = (dateStr: string) => {
  // Parse the provided date
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Default business hours (9am to 8pm)
  const allTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  // Return all slots as available by default (for simplicity)
  // In a real scenario, you might want to randomly mark some as unavailable
  // or have preset unavailable slots for certain days of the week
  return allTimeSlots.map(time => ({
    time,
    // Sunday (0) and Monday (1) have fewer slots available as an example
    isAvailable: !(dayOfWeek === 0 && ['09:00 AM', '10:00 AM'].includes(time)) && 
                 !(dayOfWeek === 1 && ['07:00 PM', '08:00 PM'].includes(time))
  }));
};

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

    try {
      // Set a timeout for the MongoDB query (increased for production environments)
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutMS = process.env.NODE_ENV === 'production' ? 30000 : 8000;
        console.log(`Setting MongoDB timeout to ${timeoutMS}ms (${process.env.NODE_ENV} environment)`);
        setTimeout(() => reject(new Error(`MongoDB connection timeout after ${timeoutMS}ms`)), timeoutMS);
      });
      
      // Try to get actual time slots with a timeout
      const availableTimeSlotsPromise = getAvailableTimeSlots(formattedDate);
      const availableTimeSlots = await Promise.race([availableTimeSlotsPromise, timeoutPromise]) as any;
      
      return new Response(JSON.stringify({ timeSlots: availableTimeSlots, source: 'mongodb' }));
    } catch (dbError) {
      console.warn('Using fallback time slots due to database error:', dbError);
      
      // Use fallback time slots when MongoDB connection fails
      const fallbackTimeSlots = getDefaultTimeSlots(date);
      
      return new Response(JSON.stringify({ 
        timeSlots: fallbackTimeSlots, 
        source: 'fallback',
        notice: 'Using estimated availability. Please contact us to confirm your booking.'
      }));
    }
  } catch (error) {
    console.error('Error in available time slots API:', error);
    
    // Get date from the URL if available, or use current date
    let dateParam = new Date().toISOString();
    try {
      // Try to extract date from request URL if available
      const url = request?.url;
      if (url) {
        const urlObj = new URL(url);
        dateParam = urlObj.searchParams.get('date') || dateParam;
      }
    } catch (e) {
      console.error('Error parsing URL in error handler:', e);
      // Continue with default date
    }
    
    // Last resort fallback
    const fallbackTimeSlots = getDefaultTimeSlots(dateParam);
    
    return new Response(JSON.stringify({ 
      timeSlots: fallbackTimeSlots,
      source: 'error-fallback',
      notice: 'Using estimated availability. Please contact us to confirm your booking.' 
    }));
  }
}
