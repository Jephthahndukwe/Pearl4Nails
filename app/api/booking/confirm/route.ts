import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const appointmentData = await req.json();

    if (!appointmentData) {
      return new NextResponse("No appointment data provided", { status: 400 });
    }

    const appointmentId = uuidv4();
    const appointmentDate = new Date(appointmentData.date);

    // Format the date into various formats for searching and display
    const dateFormats = {
      YYYYMMDD: appointmentDate.toISOString().slice(0, 10).replace(/-/g, ""), //YYYYMMDD
      MMDDYYYY: `${String(appointmentDate.getMonth() + 1).padStart(2, '0')}${String(appointmentDate.getDate()).padStart(2, '0')}${appointmentDate.getFullYear()}`, // MMDDYYYY
      DDMMYYYY: `${String(appointmentDate.getDate()).padStart(2, '0')}${String(appointmentDate.getMonth() + 1).padStart(2, '0')}${appointmentDate.getFullYear()}`, // DDMMYYYY
    };

    const formattedDate = `${String(appointmentDate.getMonth() + 1).padStart(2, '0')}/${String(appointmentDate.getDate()).padStart(2, '0')}/${appointmentDate.getFullYear()}`;

    // Format the appointment data for storage and notifications
    const appointment = {
      ...appointmentData,
      appointmentId,
      // Map services to the format expected by notification services
      services: appointmentData.services ? appointmentData.services.map((service: any) => ({
        serviceName: service.name,
        serviceTypeName: service.typeName,
        servicePrice: service.price,
        serviceDuration: service.duration,
        // Keep original properties for compatibility
        ...service
      })) : [],
      totalDuration: appointmentData.totalDuration || "",
      date: formattedDate, // Primary date format (MM/DD/YYYY)
      dateFormats: dateFormats, // Store all formats to ensure we can find it later
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      // Format customer data for existing notification services
      customer: {
        name: appointmentData.name,
        email: appointmentData.email,
        phone: appointmentData.phone,
        notes: appointmentData.notes,
      },
    }

    // TODO: Implement database storage here (e.g., MongoDB, Supabase, etc.)
    // Example: await db.collection('appointments').insertOne(appointment);
    console.log("Appointment Data (Simulated DB Storage):", appointment);

    // Return the appointment details, including the new appointmentId
    return NextResponse.json({ appointment }, { status: 201 });

  } catch (error) {
    console.error("Error processing appointment confirmation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}