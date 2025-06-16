import { NextResponse } from 'next/server';
import { connectToDatabase, getAppointmentCollection } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Test connection
    const { db, client } = await connectToDatabase();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test getting collection
    const collection = await getAppointmentCollection();
    console.log('✅ Successfully retrieved appointments collection');
    
    // Test insert
    const testAppointment = {
      appointmentId: 'test-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      date: new Date().toISOString(),
      time: '10:00 AM',
      services: [],
      status: 'test',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(testAppointment);
    console.log('✅ Successfully inserted test appointment:', result.insertedId);
    
    // Clean up
    await collection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleaned up test appointment');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection test successful',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('❌ Error testing MongoDB connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to test MongoDB connection' 
      },
      { status: 500 }
    );
  }
}
