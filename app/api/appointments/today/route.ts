import { NextResponse } from 'next/server';
import { getAppointmentCollection, formatDateForQuery } from '@/app/lib/mongodb';

export async function GET(request: Request) {
  try {
    // Get the date from query parameters or use a specific date
    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get('date') || '28-06-2025'; // Default to 28-06-2025
    
    // Convert to MM/DD/YYYY format to match MongoDB storage
    let formattedDate;
    if (requestedDate.includes('-')) {
      // Handle DD-MM-YYYY format - convert to MM/DD/YYYY
      const [day, month, year] = requestedDate.split('-');
      formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
    } else {
      // Already in MM/DD/YYYY format
      formattedDate = requestedDate;
    }

    // Get appointments collection
    const collection = await getAppointmentCollection();

    // Query for appointments on the specified date
    const appointments = await collection.find({
      date: formattedDate
    }).toArray();

    // Format the response
    const formattedAppointments = appointments.map(appointment => ({
        time: formatTimeTo12Hour(appointment.time),
        name: appointment.customer?.name || appointment.name,
        phone: appointment.customer?.phone || appointment.phone,
        service: appointment.services?.[0]?.serviceTypeName || appointment.services?.[0]?.serviceName,
        date: appointment.date
      }));

    // Return only the array of appointments
    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// Alternative version with hardcoded specific date
export async function GET_HARDCODED() {
  try {
    // Hardcoded specific date: 28-06-2025 (convert to MM/DD/YYYY)
    const specificDate = '06/28/2025'; // MM/DD/YYYY format for June 28, 2025
    
    // Format date for MongoDB query
    const formattedDate = formatDateForQuery(specificDate);

    // Get appointments collection
    const collection = await getAppointmentCollection();

    // Query for appointments on June 28, 2025
    const appointments = await collection.find({
      date: formattedDate
    }).toArray();

    // Format the response
    const formattedAppointments = appointments.map(appointment => ({
      time: formatTimeTo12Hour(appointment.time),
      name: appointment.name,
      service: appointment.service,
      date: appointment.date
    }));

    return NextResponse.json({
      date: '28-06-2025',
      appointments: formattedAppointments,
      count: formattedAppointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// Helper function to convert 24-hour time to 12-hour format with AM/PM
function formatTimeTo12Hour(time: string): string {
  // If time already contains AM/PM, return as is
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}