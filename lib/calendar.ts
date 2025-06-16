import { CalendarEvent } from "@/types/calendar";

// Helper function to format date in YYYYMMDDTHHmmss format for Google Calendar
function formatDateForGoogleCalendar(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export async function addEventToCalendar(event: CalendarEvent): Promise<boolean> {
  try {
    const start = event.start;
    const end = event.end;

    // Create Google Calendar URL
    const eventUrl = new URL('https://www.google.com/calendar/render');
    eventUrl.searchParams.set('action', 'TEMPLATE');
    eventUrl.searchParams.set('text', event.title);
    eventUrl.searchParams.set('details', event.description);
    
    // Format dates in YYYYMMDDTHHmmss format
    const startDateStr = formatDateForGoogleCalendar(start);
    const endDateStr = formatDateForGoogleCalendar(end);
    eventUrl.searchParams.set('dates', `${startDateStr}/${endDateStr}`);
    
    if (event.location) {
      eventUrl.searchParams.set('location', event.location);
    }

    // Open Google Calendar in new tab
    window.open(eventUrl.toString(), '_blank');
    return true;
  } catch (error) {
    console.error('Error adding to calendar:', error);
    return false;
  }
}
