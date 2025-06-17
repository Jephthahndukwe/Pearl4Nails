import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

export interface GoogleCalendarConfig {
  clientEmail: string;
  privateKey: string;
  calendarId: string;
  subjectEmail?: string; // Add this for impersonation
}

// Modified initialization function with user impersonation
async function initGoogleCalendar(config: GoogleCalendarConfig): Promise<calendar_v3.Calendar> {
  try {
    if (!config.clientEmail || !config.privateKey || !config.calendarId) {
      throw new Error('Missing required Google Calendar configuration. Please check your environment variables.');
    }

    console.log('Initializing Google Calendar with service account:', config.clientEmail);
    
    // Format the private key
    const formattedPrivateKey = formatPrivateKey(config.privateKey);
    
    // Create JWT with user impersonation
    const auth = new JWT({
      email: config.clientEmail,
      key: formattedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
      subject: config.subjectEmail || config.calendarId, // Impersonate the calendar owner
    });
    
    // Authorize the JWT
    console.log('Authorizing service account with user impersonation...');
    await auth.authorize();
    console.log('JWT authorization successful with user impersonation');
    
    // Initialize the Calendar API
    const calendar = google.calendar({
      version: 'v3',
      auth: auth,
    });
    
    // Test the connection
    try {
      console.log('Testing calendar access...');
      const calendarInfo = await calendar.calendars.get({
        calendarId: config.calendarId,
      });
      console.log('Calendar access successful:', calendarInfo.data.summary);
    } catch (error) {
      console.error('Google Calendar access error:', error);
      throw new Error(`Cannot access Google Calendar. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return calendar;
  } catch (error) {
    console.error('Error initializing Google Calendar:', error);
    throw new Error(`Failed to initialize Google Calendar API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to properly format the private key (keep your existing function)
function formatPrivateKey(privateKey: string): string {
  try {
    let cleanKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\r/g, '')
      .trim();
    
    if (!cleanKey.includes('-----BEGIN') && !cleanKey.includes('-----END')) {
      cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
    }
    
    cleanKey = cleanKey
      .replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n')
      .replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----')
      .replace(/\n+/g, '\n')
      .trim();
    
    const lines = cleanKey.split('\n');
    const formattedLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '-----BEGIN PRIVATE KEY-----' || trimmedLine === '-----END PRIVATE KEY-----') {
        formattedLines.push(trimmedLine);
      } else if (trimmedLine.length > 0) {
        const cleanBase64 = trimmedLine.replace(/[^A-Za-z0-9+/=]/g, '');
        
        for (let i = 0; i < cleanBase64.length; i += 64) {
          const chunk = cleanBase64.substring(i, i + 64);
          if (chunk.length > 0) {
            formattedLines.push(chunk);
          }
        }
      }
    }
    
    const result = formattedLines.join('\n');
    
    if (!result.startsWith('-----BEGIN PRIVATE KEY-----') || !result.endsWith('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format after processing');
    }
    
    return result;
  } catch (error) {
    console.error('Error formatting private key:', error);
    throw new Error('Failed to format private key. Please check that your private key is valid.');
  }
}

// Create a new calendar event
export async function createCalendarEvent(
  eventInput: GoogleCalendarEventInput,
  config: GoogleCalendarConfig
): Promise<calendar_v3.Schema$Event> {
  if (!config.calendarId) {
    throw new Error('Calendar ID is not configured');
  }
  
  try {
    const calendar = await initGoogleCalendar(config);
    
    // Helper function to ensure we have a valid Date object
    const ensureDate = (date: string | Date): Date => {
      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date object');
        }
        return date;
      }
      
      // Handle string dates
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date string: ${date}`);
      }
      return parsedDate;
    };
    
    // Ensure we have valid Date objects
    const startDate = ensureDate(eventInput.start);
    const endDate = ensureDate(eventInput.end);
    
    // Format dates as ISO strings for Google Calendar
    const formatForGoogle = (date: Date) => date.toISOString();
    
    // Create properly typed calendar event
    const calendarEvent: calendar_v3.Schema$Event = {
      summary: eventInput.summary,
      description: eventInput.description,
      start: {
        dateTime: formatForGoogle(startDate),
        timeZone: 'Africa/Lagos',
      },
      end: {
        dateTime: formatForGoogle(endDate),
        timeZone: 'Africa/Lagos',
      },
      location: eventInput.location,
      attendees: eventInput.attendees?.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name,
        responseStatus: 'needsAction', // Changed from 'accepted' to 'needsAction'
      })),
      reminders: eventInput.reminders || {
        useDefault: false, // Changed to false to use custom reminders
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 60 },      // 1 hour before
        ],
      },
      conferenceData: eventInput.conferenceData || {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };
    
    console.log('Creating calendar event:', {
      summary: calendarEvent.summary,
      start: calendarEvent.start?.dateTime,
      end: calendarEvent.end?.dateTime,
      attendees: calendarEvent.attendees?.length || 0
    });
    
    const response = await calendar.events.insert({
      calendarId: config.calendarId,
      requestBody: calendarEvent,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send invitations to all attendees
    });
    
    if (!response.data.id) {
      throw new Error('Failed to create calendar event: No event ID returned');
    }
    
    console.log('Calendar event created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error(`Failed to create calendar event: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Convert appointment data to Google Calendar event format
export function convertAppointmentToGoogleEvent(appointment: any): GoogleCalendarEventInput {
  if (!appointment.date || !appointment.time) {
    throw new Error('Appointment date and time are required');
  }
  
  const [month, day, year] = appointment.date.split('/').map(Number);
  const [time, period] = appointment.time.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  // Convert 12-hour time to 24-hour time
  if (period?.toLowerCase() === 'pm' && hours < 12) {
    hours += 12;
  } else if (period?.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }
  
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const duration = appointment.totalDuration ? parseInt(appointment.totalDuration) : 60; // Default to 60 minutes if not specified
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  
  // Ensure dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date values in appointment');
  }
  
  // Format service information
  let title = "Pearl4Nails - ";
  let description = "";

  if (appointment.services && appointment.services.length > 0) {
    // Multiple services
    const serviceNames = appointment.services
      .map((s: any) => s.serviceName || s.serviceTypeName || s.name)
      .filter(Boolean)
      .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index);
      
    title += serviceNames.length > 0 ? serviceNames.join(", ") : "Appointment";
    
    // Group services by type
    const servicesByType = (appointment.services || []).reduce((acc: Record<string, any[]>, service: any) => {
      const type = service.serviceTypeName || service.typeName || 'Services';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(service);
      return acc;
    }, {});

    // Build description with grouped services
    description = Object.entries(servicesByType)
      .map(([type, services]) => {
        const serviceList = (services as any[])
          .map(s => {
            let serviceText = `• ${s.serviceName || s.name || type}`;
            if (s.servicePrice || s.price) serviceText += ` - ${s.servicePrice || s.price}`;
            if (s.serviceDuration || s.duration) serviceText += ` (${s.serviceDuration || s.duration})`;
            return serviceText;
          })
          .join('\n');
        
        return `${type}:\n${serviceList}`;
      })
      .join('\n\n');

    if (appointment.totalDuration) {
      description += `\n\nTotal Duration: ${appointment.totalDuration}`;
    }
  } else {
    // Single service (legacy format)
    const serviceName = appointment.serviceTypeName || appointment.serviceName || appointment.service || "Appointment";
    title += serviceName.replace(/\s*\([^)]*\)/g, '').trim();
    
    description = `Service: ${serviceName}`;

    if (appointment.servicePrice || appointment.price) {
      description += `\nPrice: ${appointment.servicePrice || appointment.price}`;
    }
    if (appointment.serviceDuration || appointment.duration) {
      description += `\nDuration: ${appointment.serviceDuration || appointment.duration}`;
    }
  }

  // Add additional details
  description += `\n\n📅 Date: ${appointment.date}\n🕒 Time: ${appointment.time}\n📍 Location: ${appointment.location || 'Pearl4Nails Studio'}\n\n📞 Contact:\n✉️ Email: pearl4nails@gmail.com\n📱 Phone: 09160763206`;

  const event: GoogleCalendarEventInput = {
    summary: title,
    description: description,
    start: startDate,
    end: endDate,
    location: appointment.location || 'Pearl4Nails Studio',
    attendees: [
      { 
        email: appointment.email, 
        name: appointment.name || 'Client' 
      },
      { 
        email: process.env.EMAIL_USER || 'pearl4nails@gmail.com', 
        name: 'Pearl4Nails' 
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 hours before
        { method: 'popup', minutes: 60 },     // 1 hour before
      ],
    },
  };

  return event;
}