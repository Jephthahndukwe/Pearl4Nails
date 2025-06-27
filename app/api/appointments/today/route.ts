import { NextResponse } from 'next/server';
import { getAppointmentCollection } from '@/app/lib/mongodb';

// Convert 24hr -> 12hr
function formatTimeTo12Hour(time: string): string {
  if (time.includes('AM') || time.includes('PM')) return time;
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${period}`;
}

// Today's date formatted as MM/DD/YYYY
function getTodayFormatted(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// Convert time string like "8:30 PM" -> total minutes since midnight
function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [timePart, ampm] = time.split(' ');
  let [hour, minute] = timePart.split(':').map(Number);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

// Main GET endpoint
export async function GET(request: Request) {
  try {
    const collection = await getAppointmentCollection();
    const todayFormatted = getTodayFormatted();
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    // 1️⃣ Fetch confirmed appointments for today
    let appointmentsToday = await collection.find({
      date: todayFormatted,
      status: 'confirmed'
    }).toArray();

    // Filter out appointments where the time has already passed
    appointmentsToday = appointmentsToday.filter(appt => {
      const apptMinutes = timeToMinutes(appt.time);
      return apptMinutes >= nowMinutes;
    });

    if (appointmentsToday.length > 0) {
      // ✅ If we still have some left today
      const formatted = appointmentsToday.map(appointment => ({
        time: formatTimeTo12Hour(appointment.time),
        name: appointment.customer?.name || appointment.name,
        phone: appointment.customer?.phone || appointment.phone,
        service: appointment.services?.[0]?.serviceTypeName || appointment.services?.[0]?.serviceName,
        date: appointment.date
      }));

      return NextResponse.json({
        date: todayFormatted,
        appointments: formatted
      });
    }

    // 2️⃣ Otherwise, get next future confirmed appointment(s)
    const futureAppointments = await collection.find({
      date: { $gt: todayFormatted },
      status: 'confirmed'
    }).sort({ date: 1 }).toArray();

    if (futureAppointments.length > 0) {
      const nextDate = futureAppointments[0].date;
      const nextAppointments = futureAppointments.filter(a => a.date === nextDate);

      const formatted = nextAppointments.map(appointment => ({
        time: formatTimeTo12Hour(appointment.time),
        name: appointment.customer?.name || appointment.name,
        phone: appointment.customer?.phone || appointment.phone,
        service: appointment.services?.[0]?.serviceTypeName || appointment.services?.[0]?.serviceName,
        date: appointment.date
      }));

      return NextResponse.json({
        // date: nextDate,
        appointments: formatted
      });
    }

    // 3️⃣ No upcoming appointments at all
    return NextResponse.json({
    //   date: null,
      appointments: []
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
