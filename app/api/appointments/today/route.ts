import { NextResponse } from 'next/server';
import { getAppointmentCollection } from '@/app/lib/mongodb';

// Convert 24hr -> 12hr
function formatTimeTo12Hour(time: string): string {
  if (time.includes('AM') || time.includes('PM')) return time;
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}

// Get today's date formatted like MM/DD/YYYY
function getTodayFormatted(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// Main endpoint
export async function GET(request: Request) {
  try {
    const collection = await getAppointmentCollection();
    const todayFormatted = getTodayFormatted();

    // ✅ Fetch only confirmed appointments for today
    let appointments = await collection.find({
      date: todayFormatted,
      status: 'confirmed'
    }).toArray();

    let usedDate = todayFormatted;

    // ✅ If none for today, find the next available confirmed appointment
    if (appointments.length === 0) {
      const futureAppointments = await collection
        .find({
          date: { $gt: todayFormatted },
          status: 'confirmed'
        })
        .sort({ date: 1 }) // Earliest upcoming first
        .toArray();

      if (futureAppointments.length > 0) {
        usedDate = futureAppointments[0].date;
        appointments = futureAppointments.filter(a => a.date === usedDate);
      }
    }

    // Format and return the result
    const formatted = appointments.map(appointment => ({
      time: formatTimeTo12Hour(appointment.time),
      name: appointment.customer?.name || appointment.name,
      phone: appointment.customer?.phone || appointment.phone,
      service: appointment.services?.[0]?.serviceTypeName || appointment.services?.[0]?.serviceName,
      date: appointment.date
    }));

    return NextResponse.json({
      appointments: formatted,
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}