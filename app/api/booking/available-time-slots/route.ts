import { getAvailableTimeSlots, clearTimeSlotCache } from "@/app/api/services/appointment";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 8);
  
  const log = (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] [${requestId}] ${message}`, data || '');
  };

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const forceRefresh = searchParams.get("forceRefresh") === 'true';

    if (!date) {
      log("Error: Date parameter is missing");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Date is required",
        requestId,
        timestamp: new Date().toISOString()
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      log("Error: Invalid date format", { date });
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid date format. Please use ISO format (YYYY-MM-DD)",
        requestId,
        timestamp: new Date().toISOString()
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      });
    }

    // Convert to MM/DD/YYYY format with leading zeros
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const year = dateObj.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    log(`Processing request for date`, { 
      originalDate: date, 
      formattedDate,
      forceRefresh 
    });

    try {
      if (forceRefresh) {
        log("Force refreshing time slots cache");
        clearTimeSlotCache(formattedDate);
      }
      
      // Set a reasonable timeout (15 seconds) for the database operation
      const DB_QUERY_TIMEOUT = 15000;
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(
          () => reject(new Error(`Database query timed out after ${DB_QUERY_TIMEOUT}ms`)),
          DB_QUERY_TIMEOUT
        )
      );
      
      // Try to get data from the database with better error handling
      const dbQueryPromise = (async () => {
        try {
          log("Fetching available time slots from database");
          const startTime = Date.now();
          const result = await getAvailableTimeSlots(formattedDate);
          const duration = Date.now() - startTime;
          log(`Successfully fetched ${result.length} time slots from database`, { durationMs: duration });
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          log('Error in getAvailableTimeSlots:', { 
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
          });
          throw error;
        }
      })();
      
      const availableTimeSlots = await Promise.race([
        dbQueryPromise,
        timeoutPromise
      ]) as any[];
      
      const duration = Date.now() - startTime;
      log(`Successfully retrieved time slots`, { 
        count: availableTimeSlots.length,
        durationMs: duration 
      });
      
      return new Response(JSON.stringify({
        success: true,
        timeSlots: availableTimeSlots,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          durationMs: duration,
          date: {
            original: date,
            formatted: formattedDate,
            iso: dateObj.toISOString()
          },
          cache: {
            wasCached: !forceRefresh
          }
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      log('Error fetching time slots - falling back to default slots', { 
        error: errorMessage,
        durationMs: duration,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback to default time slots when database is unavailable
      const defaultTimeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
      ].map((time) => ({
        time,
        isAvailable: true,
      }));

      return new Response(JSON.stringify({
        success: true,
        timeSlots: defaultTimeSlots,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          durationMs: duration,
          date: {
            original: date,
            formatted: formattedDate,
            iso: dateObj.toISOString()
          },
          cache: {
            wasCached: false,
            source: 'fallback'
          },
          warning: 'Database temporarily unavailable - showing all slots as available'
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    log('Unexpected error in API route', { 
      error: errorMessage,
      durationMs: duration,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred',
      message: errorMessage,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        durationMs: duration
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
