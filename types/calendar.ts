export interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  end: Date;
}

export interface CalendarResponse {
  success: boolean;
  error?: string;
}
