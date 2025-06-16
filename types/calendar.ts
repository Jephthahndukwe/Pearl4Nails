export interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}

export interface CalendarResponse {
  success: boolean;
  error?: string;
}
