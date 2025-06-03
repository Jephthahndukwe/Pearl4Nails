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

    // Create different possible date formats to query with
    const possibleDateFormats = [
      formattedDate, // MM/DD/YYYY
      `${month}-${day}-${year}`, // MM-DD-YYYY
      `${year}-${month}-${day}`, // YYYY-MM-DD
      dateParamObj.toISOString().split("T")[0], // YYYY-MM-DD ISO format
      new Date(dateParamObj).toLocaleDateString("en-US"), // Locale-specific format
    ]

    console.log(`Searching with date formats:`, possibleDateFormats)

    // Build a comprehensive query that checks all possible date locations
    let bookedAppointments = []
    try {
      const query = {
        $or: [
          // Check the primary date field
          { date: { $in: possibleDateFormats } },
          // Check inside dateFormats structure (for newer appointments)
          { "dateFormats.standard": formattedDate },
          { "dateFormats.iso": dateParamObj.toISOString().split("T")[0] },
          { "dateFormats.dash": `${month}-${day}-${year}` },
          { "dateFormats.ymd": `${year}-${month}-${day}` },
          // If the date is stored as a Date object in MongoDB
          {
            date: {
              $gte: new Date(new Date(formattedDate).setHours(0, 0, 0, 0)),
              $lt: new Date(new Date(formattedDate).setHours(23, 59, 59, 999))
            }
          }
        ],
        status: { $in: ["confirmed", "pending"] }
      };
      
      console.log('Executing MongoDB query:', JSON.stringify(query, null, 2));
      
      const cursor = collection.find(query);
      if (!cursor) {
          console.error('Failed to create cursor for query');
          return getDefaultTimeSlots();
        }
        
        bookedAppointments = await cursor.toArray();
      } catch (queryError) {
      console.error("Error querying appointments:", queryError)
      return getDefaultTimeSlots() // Return default slots on query error
    }

    console.log(`[${process.env.NODE_ENV}] Booked appointments found:`, bookedAppointments.length)

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
          durationMinutes = appointment.services.reduce((total, service) => {
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

    // Create array of available time slots
    const availableTimeSlots = allTimeSlots.map((time) => {
      try {
        const timeInMinutes = parseTimeToMinutes(time)

        // Check if this time slot is within any blocked range
        const isBlocked = blockedTimeRanges.some((range) => timeInMinutes >= range.start && timeInMinutes < range.end)

        return {
          time,
          isAvailable: !isBlocked,
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
const timeSlotCache: Record<string, { data: any; timestamp: number }> = {}
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

// Function to cancel an appointment
export async function cancelAppointment(appointmentId: string): Promise<{ success: boolean; redirectUrl: string }> {
  try {
    // Validate the appointment ID format
    if (!appointmentId || typeof appointmentId !== 'string' || !isValidObjectId(appointmentId)) {
      throw new Error('Invalid appointment ID format');
    }

    // Get the appointment collection
    const collection = await getAppointmentCollection();
    if (!collection) {
      throw new Error('Failed to connect to the database');
    }

    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const query = { _id: new ObjectId(appointmentId) };

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
function clearTimeSlotCache(date?: string) {
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