// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 8);
  
  const log = (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] [${requestId}] ${message}`, data || '');
  };

  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    log('Attempting to connect to MongoDB', { 
      maskedUri: uri.replace(/(?<=mongodb\+srv:\/\/)([^:]+):([^@]+)/, '***:***')
    });
    
    const client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 1,
      retryWrites: true,
      retryReads: true,
    });

    try {
      await client.connect();
      const db = client.db('pearl4nails'); // Explicitly specify the database name
      
      // Test a simple findOne query instead of serverStatus
      const testCollection = db.collection('appointments');
      const testDoc = await testCollection.findOne({});
      
      // Also get collection names
      const collections = await db.listCollections().toArray().catch(() => []);
      
      return NextResponse.json({
        success: true,
        connection: {
          status: 'connected',
          durationMs: Date.now() - startTime,
          database: db.databaseName,
          collections: collections.map((c: any) => c.name),
          testDocument: testDoc ? 'Found a document' : 'No documents found'
        }
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('Database connection failed', { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to connect to MongoDB',
      message: errorMessage,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime
      }
    }, { status: 500 });
  }
}