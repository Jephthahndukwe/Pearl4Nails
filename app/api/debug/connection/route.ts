import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

// Diagnostic endpoint to check database connection without exposing sensitive details
export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB for diagnostic check...');
    const startTime = Date.now();
    
    // Try to connect to the database
    const db = await connectToDatabase();
    const endTime = Date.now();
    const connectionTime = endTime - startTime;
    
    // Check if collections can be accessed
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    // Check appointments collection specifically
    const appointmentCollectionExists = collectionNames.includes('appointments');
    let appointmentStats = null;
    
    if (appointmentCollectionExists) {
      const collection = db.collection('appointments');
      // Get total count of appointments
      const totalCount = await collection.countDocuments();
      // Get count of confirmed appointments
      const confirmedCount = await collection.countDocuments({ status: 'confirmed' });
      // Get count by status
      const statusCounts = await collection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray();
      
      appointmentStats = {
        totalCount,
        confirmedCount,
        statusCounts
      };
    }
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      connection: {
        connected: true,
        connectionTimeMs: connectionTime,
        mongoDbUriDefined: !!process.env.MONGODB_URI,
        // Don't expose the actual connection string
        uriStart: process.env.MONGODB_URI 
          ? `${process.env.MONGODB_URI.substring(0, 12)}...` 
          : 'not defined'
      },
      collections: {
        total: collections.length,
        names: collectionNames,
        appointmentCollectionExists
      },
      appointmentStats
    });
  } catch (error: any) {
    console.error('Diagnostic connection check failed:', error);
    
    return NextResponse.json({
      success: false,
      environment: process.env.NODE_ENV,
      error: {
        message: error.message,
        name: error.name,
        // Don't include the full stack in the response
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      connection: {
        connected: false,
        mongoDbUriDefined: !!process.env.MONGODB_URI,
        uriStart: process.env.MONGODB_URI 
          ? `${process.env.MONGODB_URI.substring(0, 12)}...` 
          : 'not defined'
      }
    }, { status: 500 });
  }
}
