import { NextResponse } from 'next/server';
import { getAppointmentCollection } from '@/app/lib/mongodb';

function formatTimeTo12Hour(time: string) {
  if (time.includes('AM') || time.includes('PM')) return time;
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${period}`;
}

function getTodayFormatted() {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function getTomorrowFormatted() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const yyyy = tomorrow.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export async function GET(request: Request) {
  try {
    const collection = await getAppointmentCollection();
    const today = getTodayFormatted();
    const tomorrow = getTomorrowFormatted();

    // Get appointments for today + tomorrow only
    let appointments = await collection.find({
      date: { $in: [today, tomorrow] },
      status: 'confirmed'
    }).sort({ date: 1, time: 1 }).toArray();

    // Format output
    const formatted = appointments.map(appointment => ({
      duration: appointment.totalDuration,
      name: appointment.customer?.name || appointment.name,
      service: appointment.services?.[0]?.serviceTypeName || appointment.services?.[0]?.serviceName,
      price: appointment.totalPrice,
      date: appointment.date
    }));

    return NextResponse.json({ appointments: formatted });

  } catch (err) {
    console.error('Error fetching appointments:', err);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
