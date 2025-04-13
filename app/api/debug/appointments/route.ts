import { NextResponse } from 'next/server';
import { getAppointmentCollection } from '@/app/lib/mongodb';

export async function GET(request: Request) {
  try {
    const collection = await getAppointmentCollection();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      const allAppointments = await collection.find({}).toArray();
      return NextResponse.json({ appointments: allAppointments });
    }

    const appointments = await collection.find({
      date: date,
      $or: [{ status: 'confirmed' }, { status: 'pending' }]
    }).toArray();

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch appointments',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
