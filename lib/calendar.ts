import { CalendarEvent } from "@/types/calendar";

export async function addEventToCalendar(event: CalendarEvent): Promise<boolean> {
  try {
    const start = event.start;
    const end = event.end;

    // Create Google Calendar URL
    const eventUrl = new URL('https://calendar.google.com/calendar/render');
    eventUrl.searchParams.set('action', 'TEMPLATE');
    eventUrl.searchParams.set('text', event.title);
    eventUrl.searchParams.set('details', event.description);
    eventUrl.searchParams.set('dates', `${start.toISOString()}/${end.toISOString()}`);

    // Open Google Calendar in new tab
    window.open(eventUrl.toString(), '_blank');
    return true;
  } catch (error) {
    console.error('Error adding to calendar:', error);
    return false;
  }
}
