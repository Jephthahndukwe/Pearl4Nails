import { NextResponse } from 'next/server';
import { createAppointment } from '@/app/api/services/appointment';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['service', 'date', 'time', 'name', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Create appointment
    const appointment = await createAppointment({
      service: data.service,
      date: data.date,
      time: data.time,
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes || ''
      },
      nailShape: data.nailShape || '',
      nailDesign: data.nailDesign || '',
      tattooLocation: data.tattooLocation || '',
      tattooSize: data.tattooSize || '',
      referenceImage: data.referenceImage || '',
      location: "15 Osolo Way Off 7&8 bus stop, Ajao estate, Lagos, Nigeria",
      contact: {
        email: "nwabuezemercy2@gmail.com",
        phone: "+234 916 076 3206"
      },
      preparation: [
        "Please arrive 15 minutes early for your appointment",
        "Avoid wearing nail polish on the day of your appointment",
        "Bring any reference images you would like to show",
        "Feel free to bring your own nail art inspiration"
      ]
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error in booking confirmation:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to confirm booking' }, { status: 500 });
  }
}
