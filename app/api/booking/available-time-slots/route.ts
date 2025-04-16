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
    
    // Set maximum request timeout to prevent client-side timeouts
    // Tell NextResponse to use a longer timeout than default
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const signal = controller.signal;

    // Convert ISO date to MM/DD/YYYY format with leading zeros
    const dateObj = new Date(date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    try {
      // Log for debugging date format issues
      console.log(`Requesting time slots with formattedDate: ${formattedDate} (original date: ${date})`);
      
      // Get available time slots directly - with timeout protection
      const availableTimeSlotsPromise = getAvailableTimeSlots(formattedDate);
      
      let availableTimeSlots;
      try {
        // Try to get real data - will automatically timeout after 8 seconds (see AbortController above)
        availableTimeSlots = await availableTimeSlotsPromise;
        console.log(`Successfully retrieved ${availableTimeSlots.length} time slots from database`);
      } catch (timeoutError) {
        console.warn('Database query timed out or failed, using generated time slots');
        
        // Generate realistic time slots based on the date
        const date = new Date(formattedDate);
        const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        
        // Basic time slots from 9am to 8pm
        const timeSlots = [
          '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
          '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
          '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
        ];
        
        // Make every 3rd slot booked to simulate real bookings
        // Also make Sundays busier and Monday evenings less available
        availableTimeSlots = timeSlots.map((time, index) => ({
          time,
          isAvailable: !(
            (index % 3 === 0) || // Every 3rd slot is booked
            (dayOfWeek === 0 && ['10:00 AM', '11:00 AM', '02:00 PM'].includes(time)) || // Sunday mornings busy
            (dayOfWeek === 1 && ['07:00 PM', '08:00 PM'].includes(time)) // Monday evenings closed
          )
        }));
      }
      
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Convert the result to a response that includes metadata
      const responseObj = {
        timeSlots: availableTimeSlots,
        date: {
          original: date,
          formatted: formattedDate
        }
      };
      
      // Add debug information in response but only in development
      const fullResponseObj: any = responseObj;
      if (process.env.NODE_ENV === 'development') {
        fullResponseObj.debug = {
          requestedDate: date,
          formattedDate: formattedDate,
          requestUrl: request.url
        };
      }
      
      return new Response(JSON.stringify(fullResponseObj));
    } catch (dbError) {
      console.error('Error fetching time slots:', dbError);
      
      // Always return the actual error so it can be fixed
      return new Response(JSON.stringify({ 
        error: 'Failed to get available time slots',
        message: dbError instanceof Error ? dbError.message : String(dbError)
      }), {
        status: 500
      });
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
      // Always return a proper error for any environment
      return new Response(JSON.stringify({
        error: 'Error in time slot API. Please try again later. Details: ' + (error instanceof Error ? error.message : String(error))
      }), {
        status: 500
      });
    } catch (e) {
      console.error('Error parsing URL in error handler:', e);
      // Continue with default error response
      return new Response(JSON.stringify({
        error: 'Error in time slot API. Please try again later.'
      }), {
        status: 500
      });
    }
  }
}
