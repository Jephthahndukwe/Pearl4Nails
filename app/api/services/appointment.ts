// api/services/appointment.ts

import { getAppointmentCollection, queryWithTimeout } from "@/app/lib/mongodb"

export async function getAvailableTimeSlots(searchDate: string): Promise<{ time: string; isAvailable: boolean }[]> {
  try {
    // Parse and validate the search date
    const dateParamObj = new Date(searchDate)
    if (isNaN(dateParamObj.getTime())) {
      console.error(`❌ Invalid date format: ${searchDate}`)
      return getDefaultTimeSlots() // Return default slots for invalid dates
    }

    const day = String(dateParamObj.getDate()).padStart(2, "0")
    const month = String(dateParamObj.getMonth() + 1).padStart(2, "0")
    const year = dateParamObj.getFullYear()
    // Use YYYY-MM-DD format to match database storage
    const formattedDate = `${year}-${month}-${day}`

    // Check cache first (implement simple in-memory cache)
    const cacheKey = `timeslots_${formattedDate}`
    const now = Date.now()
    const cachedData = timeSlotCache[cacheKey]

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      console.log(`📋 Using cached time slots for ${formattedDate}`)
      return cachedData.data
    }

    console.log(`🔍 Fetching appointments for date: ${formattedDate}`)

    // Get collection with timeout and retry
    let collection;
    try {
      collection = await getAppointmentCollection();
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      console.error("❌ Failed to connect to appointment collection:", errorMessage);
      return getDefaultTimeSlots();
    }

    console.log("✅ Successfully connected to MongoDB")

    // Build comprehensive query for date matching using YYYY-MM-DD format
    const [yearStr, monthStr, dayStr] = formattedDate.split('-')
    const yearNum = parseInt(yearStr, 10)
    const monthNum = parseInt(monthStr, 10) - 1 // JavaScript months are 0-indexed
    const dayNum = parseInt(dayStr, 10)
    
    // Create date range for UTC queries
    const startOfDay = new Date(Date.UTC(yearNum, monthNum, dayNum, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(yearNum, monthNum, dayNum, 23, 59, 59, 999));
    
    // Generate all possible date formats for comprehensive matching
    const dateFormats = {
      formattedDate: `${monthStr.padStart(2, '0')}/${dayStr.padStart(2, '0')}/${yearNum}`,  // MM/DD/YYYY
      isoDate: startOfDay.toISOString().split('T')[0], // YYYY-MM-DD
      yyyymmdd: `${yearNum}${monthStr.padStart(2, '0')}${dayStr.padStart(2, '0')}`,
      mmddyyyy: `${monthStr.padStart(2, '0')}${dayStr.padStart(2, '0')}${yearNum}`,
      ddmmyyyy: `${dayStr.padStart(2, '0')}${monthStr.padStart(2, '0')}${yearNum}`
    };

    console.log('🎯 Date search parameters:', {
      inputDate: formattedDate,
      dateFormats,
      dateRange: {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      }
    });

    // Execute query with timeout protection
    let bookedAppointments: any[] = [];
    
    try {
      const query = {
        $or: [
          // Exact string matches for various formats  
          { date: dateFormats.formattedDate },
          { date: dateFormats.isoDate },
          
          // Date object range queries
          {
            date: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          },
          
          // Alternative date format fields
          { 'dateFormats.YYYYMMDD': dateFormats.yyyymmdd },
          { 'dateFormats.MMDDYYYY': dateFormats.mmddyyyy },
          { 'dateFormats.DDMMYYYY': dateFormats.ddmmyyyy },
          { 'dateFormats.iso': dateFormats.isoDate },
        ],
        status: { $in: ["confirmed", "pending"] }
      };
      
      console.log('📝 Executing optimized MongoDB query');
      
      // Use our timeout wrapper for the query
      bookedAppointments = await queryWithTimeout(
        collection,
        async () => {
          const cursor = collection.find(query);
          return await cursor.toArray();
        },
        4000 // 4 second timeout for query
      );
      
      console.log(`📊 Found ${bookedAppointments.length} appointments for ${formattedDate}`);
      
      // Log appointments for debugging
      if (bookedAppointments.length > 0) {
        console.log('📋 Booked appointments:');
        bookedAppointments.forEach((appt: any, index: number) => {
          console.log(`  [${index + 1}] ${appt.time} - ${appt.date} (ID: ${appt.appointmentId || appt._id})`);
        });
      }
      
    } catch (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Unknown query error';
      console.error('❌ Database query error:', errorMessage);
      
      // If it's a timeout, we want to know
      if (errorMessage.includes('timeout')) {
        console.error('⏰ Database query timed out - returning default slots');
      }
      
      return getDefaultTimeSlots(); // Return default slots on query error
    }

    // Calculate time slot availability
    const availableTimeSlots = calculateAvailableSlots(bookedAppointments);

    // Cache the result
    timeSlotCache[cacheKey] = {
      data: availableTimeSlots,
      timestamp: now,
    }

    console.log(`✅ Calculated ${availableTimeSlots.filter(slot => slot.isAvailable).length} available slots`);
    return availableTimeSlots;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in getAvailableTimeSlots:', errorMessage);
    
    // Log additional context in production
    if (process.env.NODE_ENV === "production") {
      console.error("🔍 Production error details:", {
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: errorMessage,
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : 'Unknown', // First 3 lines of stack
        timestamp: new Date().toISOString()
      })
    }
    
    // Always return default time slots on error
    return getDefaultTimeSlots()
  }
}

// Optimized slot calculation function
function calculateAvailableSlots(bookedAppointments: any[]): { time: string; isAvailable: boolean }[] {
  const allTimeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
  ];

  // Calculate blocked time ranges
  const blockedTimeRanges: { start: number; end: number }[] = [];

  bookedAppointments.forEach((appointment) => {
    try {
      if (!appointment.time) {
        console.warn("⚠️ Appointment missing time field:", appointment.appointmentId || appointment._id);
        return;
      }

      const startTime = parseTimeToMinutes(appointment.time);
      let durationMinutes = 60; // Default duration

      // Calculate total duration from various possible fields
      if (appointment.totalDuration) {
        durationMinutes = parseDurationToMinutes(appointment.totalDuration);
      } else if (appointment.services && appointment.services.length > 0) {
        durationMinutes = appointment.services.reduce((total: number, service: any) => {
          return total + parseDurationToMinutes(service.duration || "60 minutes");
        }, 0);
      } else if (appointment.serviceDuration) {
        durationMinutes = parseDurationToMinutes(appointment.serviceDuration);
      }

      const endTime = startTime + durationMinutes;
      blockedTimeRanges.push({ start: startTime, end: endTime });

    } catch (error) {
      console.error("❌ Error processing appointment:", error, appointment.appointmentId || appointment._id);
    }
  });

  // Check availability for each time slot
  return allTimeSlots.map((time) => {
    try {
      const timeInMinutes = parseTimeToMinutes(time);
      const slotEndTime = timeInMinutes + 60; // Standard 1-hour slots
      
      // Check for overlaps with blocked ranges
      const isBlocked = blockedTimeRanges.some(({ start, end }) => {
        return timeInMinutes < end && slotEndTime > start;
      });
      
      return {
        time,
        isAvailable: !isBlocked
      };
    } catch (error) {
      console.error(`❌ Error processing time slot: ${time}`, error);
      return {
        time,
        isAvailable: true, // Default to available on error
      };
    }
  });
}

// Helper function to parse time string to minutes since midnight
const parseTimeToMinutes = (timeStr: string): number => {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) throw new Error(`Invalid time format: ${timeStr}`);
    
    const [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Convert to 24-hour format
    if (period.toUpperCase() === "PM" && hour < 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
  } catch (error) {
    console.error(`❌ Error parsing time: ${timeStr}`, error);
    return 0; // Default to midnight if parsing fails
  }
};

// Helper function to calculate duration in minutes from string
const parseDurationToMinutes = (durationStr: string): number => {
  if (!durationStr) return 60;

  try {
    let totalMinutes = 0;
    const hourMatch = durationStr.match(/(\d+)\s*hours?/i);
    const minuteMatch = durationStr.match(/(\d+)\s*minutes?/i);

    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1], 10);
    }

    return totalMinutes || 60; // Default to 60 minutes
  } catch (error) {
    console.error(`❌ Error parsing duration: ${durationStr}`, error);
    return 60;
  }
};

// Cache for time slots with shorter TTL for faster updates
export const timeSlotCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 2 * 60 * 1000 // Reduced to 2 minutes for fresher data

// Helper function to get default time slots
function getDefaultTimeSlots(): { time: string; isAvailable: boolean }[] {
  console.log("🔄 Returning default time slots (all available)")
  return [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
  ].map(time => ({ time, isAvailable: true }))
}

// Validation functions
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Optimized cancel appointment function
export async function cancelAppointment(appointmentId: string): Promise<{ appointment: any; redirectUrl: string }> {
  try {
    // Validate appointment ID
    if (!appointmentId || typeof appointmentId !== 'string' || 
        (!isValidObjectId(appointmentId) && !isValidUUID(appointmentId))) {
      throw new Error('Invalid appointment ID format');
    }

    // Get collection with timeout
    const collection = await getAppointmentCollection();
    
    // First find the appointment to get its details
    const appointment = await queryWithTimeout(
      collection,
      async () => {
        return await collection.findOne({ appointmentId: appointmentId });
      },
      3000 // 3 second timeout for find
    );

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Use timeout wrapper for the update operation
    const result = await queryWithTimeout(
      collection,
      async () => {
        return await collection.updateOne(
          { appointmentId: appointmentId },
          { 
            $set: { 
              status: 'cancelled',
              updatedAt: new Date() 
            } 
          }
        );
      },
      3000 // 3 second timeout for update
    );

    if (result.matchedCount === 0) {
      throw new Error('Appointment not found or already cancelled');
    }

    // Clear cache
    clearTimeSlotCache();

    console.log(' Successfully cancelled appointment:', appointmentId);

    return {
      appointment,
      redirectUrl: '/booking/cancelled'
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in cancelAppointment:', errorMessage);
    throw error;
  }
}

// Cache management
export function clearTimeSlotCache(date?: string) {
  if (date) {
    // Clear specific date
    const dateObj = new Date(date)
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    const year = dateObj.getFullYear()
    const formattedDate = `${month}/${day}/${year}`
    
    const cacheKey = `timeslots_${formattedDate}`
    if (timeSlotCache[cacheKey]) {
      delete timeSlotCache[cacheKey]
      console.log(`🗑️ Cleared cache for date: ${formattedDate}`)
    }
  } else {
    // Clear all cache
    const cacheKeys = Object.keys(timeSlotCache);
    cacheKeys.forEach(key => delete timeSlotCache[key]);
    console.log(`🗑️ Cleared all time slot cache (${cacheKeys.length} entries)`);
  }
}