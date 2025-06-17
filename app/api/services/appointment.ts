// api/services/appointment.ts

import { connectToDatabase, getAppointmentCollection, formatDateForQuery } from "@/app/lib/mongodb"

export async function getAvailableTimeSlots(searchDate: string): Promise<{ time: string; isAvailable: boolean }[]> {
  try {
    // Parse the search date into day/month/year
    const dateParamObj = new Date(searchDate)
    if (isNaN(dateParamObj.getTime())) {
      console.error(`Invalid date format: ${searchDate}`)
      return getDefaultTimeSlots() // Return default slots for invalid dates
    }

    const day = String(dateParamObj.getDate()).padStart(2, "0")
    const month = String(dateParamObj.getMonth() + 1).padStart(2, "0")
    const year = dateParamObj.getFullYear()
    const formattedDate = `${month}/${day}/${year}`

    // Check if we have valid cached data
    const cacheKey = `timeslots_${formattedDate}`
    const now = Date.now()
    const cachedData = timeSlotCache[cacheKey]

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      console.log("Returning cached time slots for date:", formattedDate)
      return cachedData.data
    }

    console.log(`Fetching appointments for date: ${formattedDate}`)
    console.log(`Connecting to MongoDB for date: ${formattedDate}`)

    // Try to connect to MongoDB and get the collection
    let collection;
    try {
      const result = await getAppointmentCollection();
      if (!result) {
        console.error("Failed to get appointment collection: No result returned");
        return getDefaultTimeSlots();
      }
      collection = result;
      
      if (!collection) {
        console.error("Appointment collection is null or undefined");
        return getDefaultTimeSlots();
      }
    } catch (dbError) {
      console.error("Failed to connect to appointment collection:", dbError);
      return getDefaultTimeSlots();
    }

    console.log("Successfully connected to MongoDB")

    // Parse the input date string (MM/DD/YYYY) into components
    const [monthStr, dayStr, yearStr] = formattedDate.split('/');
    const monthNum = parseInt(monthStr, 10);
    const dayNum = parseInt(dayStr, 10);
    const yearNum = parseInt(yearStr, 10);
    
    // Create date objects in local timezone
    const localDate = new Date(yearNum, monthNum - 1, dayNum);
    
    // Create dates that are clearly in the correct timezone
    const startOfDay = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, 23, 59, 59, 999));
    
    // Format dates for query
    const yyyy = String(yearNum);
    const mm = monthStr.padStart(2, '0');
    const dd = dayStr.padStart(2, '0');
    
    // Generate all possible date formats
    const dateFormats = {
      formattedDate: `${mm}/${dd}/${yyyy}`,  // MM/DD/YYYY
      isoDate: startOfDay.toISOString().split('T')[0], // YYYY-MM-DD
      yyyymmdd: `${yyyy}${mm}${dd}`,
      mmddyyyy: `${mm}${dd}${yyyy}`,
      ddmmyyyy: `${dd}${mm}${yyyy}`
    };

    console.log('Searching appointments for date:', {
      inputDate: formattedDate,
      dateFormats,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      localDate: localDate.toString()
    });

    // Build query to find all appointments on this date
    let bookedAppointments: any[] = [];
    try {
      const query = {
        $or: [
          // Check exact date string match (MM/DD/YYYY)
          { date: dateFormats.formattedDate },
          // Check date range for Date objects (with timezone handling)
          {
            date: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          },
          // Check all date format variations
          { 'dateFormats.YYYYMMDD': dateFormats.yyyymmdd },
          { 'dateFormats.MMDDYYYY': dateFormats.mmddyyyy },
          { 'dateFormats.DDMMYYYY': dateFormats.ddmmyyyy },
          { 'dateFormats.iso': dateFormats.isoDate },
          // Also check if date is stored as ISO string
          { date: dateFormats.isoDate }
        ],
        status: { $in: ["confirmed", "pending"] }
      };
      
      console.log('Executing MongoDB query:', JSON.stringify(query, null, 2));
      
      // Log the exact query being sent to MongoDB
      console.log('Executing MongoDB find with query:', JSON.stringify(query, null, 2));
      
      // Execute the query
      const cursor = collection.find(query);
      if (!cursor) {
        console.error('Failed to create cursor for query');
        return getDefaultTimeSlots();
      }
      
      // Get the count of matching documents
      const count = await collection.countDocuments(query);
      console.log(`MongoDB found ${count} matching documents`);
      
      // Get the actual documents
      bookedAppointments = await cursor.toArray();
      
      // Log the raw query and results for debugging
      console.log('MongoDB query details:', JSON.stringify({
        collection: collection.collectionName,
        query: {
          ...query,
          // Simplify the query for logging
          $or: query.$or.map(cond => {
            if (cond.date && typeof cond.date === 'object') {
              return { date: { $gte: 'Date', $lt: 'Date' } };
            }
            return cond;
          })
        },
        options: {}
      }, null, 2));
      
      console.log(`Found ${bookedAppointments.length} appointments for ${formattedDate}`);
      
      // Log a summary of the found appointments
      if (bookedAppointments.length > 0) {
        console.log('Appointments found:');
        bookedAppointments.forEach((appt: any, index: number) => {
          console.log(`[${index + 1}] Date: ${appt.date}, Time: ${appt.time}, ID: ${appt._id}`);
        });
      }
    } catch (queryError) {
      console.error("Error querying appointments:", queryError);
      if (queryError instanceof Error) {
        console.error('Error details:', {
          name: queryError.name,
          message: queryError.message,
          stack: queryError.stack
        });
      }
      return getDefaultTimeSlots(); // Return default slots on query error
    }

    console.log(`[${process.env.NODE_ENV}] Booked appointments found:`, bookedAppointments.length);
    console.log('Found appointments:', JSON.stringify(bookedAppointments, null, 2));
    
    // Log the first few documents in the collection for debugging
    try {
      const firstFew = await collection.find({}).limit(5).toArray();
      console.log('First 5 documents in collection:', JSON.stringify(firstFew, null, 2));
    } catch (error) {
      console.error('Error fetching sample documents:', error);
    }

    // Get all possible time slots (9am to 8pm)
    const allTimeSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
      "07:00 PM",
      "08:00 PM",
    ]

    // Helper function to parse time string to minutes since midnight
    const parseTimeToMinutes = (timeStr: string): number => {
      try {
        const [hourStr, minuteStr, period] = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/).slice(1)
        let hour = Number.parseInt(hourStr)
        const minute = Number.parseInt(minuteStr)

        // Convert to 24-hour format
        if (period === "PM" && hour < 12) hour += 12
        if (period === "AM" && hour === 12) hour = 0

        return hour * 60 + minute
      } catch (error) {
        console.error(`Error parsing time string: ${timeStr}`, error)
        return 0 // Default to midnight if parsing fails
      }
    }

    // Helper function to calculate duration in minutes from string
    const parseDurationToMinutes = (durationStr: string): number => {
      if (!durationStr) return 60 // Default to 60 minutes if no duration string

      try {
        let totalMinutes = 0

        const hourMatch = durationStr.match(/(\d+)\s*hours?/)
        const minuteMatch = durationStr.match(/(\d+)\s*minutes?/)

        if (hourMatch) {
          totalMinutes += Number.parseInt(hourMatch[1]) * 60
        }
        if (minuteMatch) {
          totalMinutes += Number.parseInt(minuteMatch[1])
        }

        // Default to 60 minutes if no valid duration found
        return totalMinutes || 60
      } catch (error) {
        console.error(`Error parsing duration string: ${durationStr}`, error)
        return 60 // Default to 60 minutes if parsing fails
      }
    }

    // Calculate blocked time ranges for each appointment
    const blockedTimeRanges: { start: number; end: number }[] = []

    bookedAppointments.forEach((appointment) => {
      try {
        if (!appointment.time) {
          console.warn("Appointment missing time field:", appointment)
          return // Skip this appointment
        }

        const startTime = parseTimeToMinutes(appointment.time)

        // Calculate duration - either from totalDuration or from individual services
        let durationMinutes = 60 // Default to 1 hour if no duration info

        if (appointment.totalDuration) {
          durationMinutes = parseDurationToMinutes(appointment.totalDuration)
        } else if (appointment.services && appointment.services.length > 0) {
          // Sum up durations of all services
          durationMinutes = appointment.services.reduce((total: number, service: any) => {
            return total + parseDurationToMinutes(service.duration || "60 minutes")
          }, 0)
        } else if (appointment.serviceDuration) {
          // Legacy: single service duration
          durationMinutes = parseDurationToMinutes(appointment.serviceDuration)
        }

        const endTime = startTime + durationMinutes

        blockedTimeRanges.push({ start: startTime, end: endTime })
      } catch (error) {
        console.error("Error processing appointment:", error, appointment)
        // Continue with next appointment
      }
    })

    // Create array of available time slots with better time slot checking
    const availableTimeSlots = allTimeSlots.map((time) => {
      try {
        const timeInMinutes = parseTimeToMinutes(time)
        const slotEndTime = timeInMinutes + 60 // Assume each slot is 1 hour by default
        
        // Check if this time slot overlaps with any blocked time ranges
        const isBlocked = blockedTimeRanges.some(({ start, end }) => {
          // Check for overlap: current slot starts before blocked range ends AND current slot ends after blocked range starts
          return timeInMinutes < end && slotEndTime > start
        })
        
        console.log(`Time slot ${time} (${timeInMinutes}-${slotEndTime}min) is ${isBlocked ? 'blocked' : 'available'}`)
        
        return {
          time,
          isAvailable: !isBlocked
        }
      } catch (error) {
        console.error(`Error processing time slot: ${time}`, error)
        return {
          time,
          isAvailable: true, // Default to available if there's an error
        }
      }
    })

    // Store result in cache
    timeSlotCache[cacheKey] = {
      data: availableTimeSlots,
      timestamp: now,
    }

    return availableTimeSlots
  } catch (error: unknown) {
    const err = error as Error
    console.error(`[${process.env.NODE_ENV}] Error getting available time slots:`, err)
    // Add specific error detection for Netlify
    if (process.env.NODE_ENV === "production") {
      console.error("Production environment detected, detailed error info:", {
        errorName: err.name,
        errorMessage: err.message,
        stack: err.stack,
      })
    }
    
    // Always return default time slots on error
    return getDefaultTimeSlots()
  }
}

// Cache for time slots to avoid repeated database queries
export const timeSlotCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Helper function to get default time slots
function getDefaultTimeSlots(): { time: string; isAvailable: boolean }[] {
  console.log("Returning default time slots (all available)")
  return [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
  ].map(time => ({ time, isAvailable: true }))
}

// Function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Function to validate UUID
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Function to cancel an appointment
export async function cancelAppointment(appointmentId: string): Promise<{ success: boolean; redirectUrl: string }> {
  try {
    // Validate the appointment ID format
    if (!appointmentId || typeof appointmentId !== 'string' || 
        (!isValidObjectId(appointmentId) && !isValidUUID(appointmentId))) {
      throw new Error('Invalid appointment ID format');
    }

    // Get the appointment collection
    const collection = await getAppointmentCollection();
    if (!collection) {
      throw new Error('Failed to connect to the database');
    }

    // For UUIDs, we store them in the appointmentId field, not _id
    const query = { appointmentId: appointmentId };

    // Update the appointment status to 'cancelled'
    const result = await collection.updateOne(
      query,
      { 
        $set: { 
          status: 'cancelled',
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Appointment not found or already cancelled');
    }

    // Clear the time slot cache since we've modified an appointment
    clearTimeSlotCache();

    // If we get here, the update was successful
    console.log('Successfully cancelled appointment:', appointmentId);

    return {
      success: true,
      redirectUrl: '/booking/cancelled'
    };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

// Helper function to clear the time slot cache
export function clearTimeSlotCache(date?: string) {
  if (date) {
    // Clear cache for specific date
    const dateObj = new Date(date)
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    const year = dateObj.getFullYear()
    const formattedDate = `${month}/${day}/${year}`
    
    const cacheKey = `timeslots_${formattedDate}`
    if (timeSlotCache[cacheKey]) {
      delete timeSlotCache[cacheKey]
      console.log(`Cleared cache for date: ${formattedDate}`)
    }
  } else {
    // Clear all cache
    Object.keys(timeSlotCache).forEach(key => {
      delete timeSlotCache[key]
    })
    console.log("Cleared all time slot cache")
  }
}