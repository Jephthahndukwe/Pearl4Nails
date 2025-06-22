import { MongoClient, Db, Collection, type MongoClientOptions, type AuthMechanism } from 'mongodb';

// Global connection variables
let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;

// Optimized connection configuration for serverless environments
const CONNECTION_CONFIG = {
  // Connection pool settings
  maxPoolSize: 5,
  minPoolSize: 1,

  // Timeout settings
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 20000,
  heartbeatFrequencyMS: 10000,

  // Connection management
  maxIdleTimeMS: 60000,
  waitQueueTimeoutMS: 10000,

  // Network and retry settings
  retryWrites: true,
  retryReads: true,

  // Compression
  compressors: ['zlib' as const],

  // Monitoring and debugging
  monitorCommands: process.env.NODE_ENV === 'development',

  // Authentication
  authMechanism: 'DEFAULT' as AuthMechanism,
  authSource: 'admin'
};

// Health check function with faster timeout
const isConnectionHealthy = async (): Promise<boolean> => {
  if (!client || !db) return false;

  try {
    // Quick ping with 2 second timeout
    await client.db('admin').command(
      { ping: 1 },
      {
        timeoutMS: 2000,
        readPreference: 'primaryPreferred'
      }
    );
    return true;
  } catch (error) {
    console.log('⚠️ Connection health check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Setup MongoDB connection event listeners
const setupConnectionEventListeners = () => {
  if (!client) return;

  // Connection monitoring
  // client.on('serverHeartbeatFailed', (event) => {
  //   console.warn('💓 MongoDB heartbeat failed:', event.failure?.message || 'Unknown error');
  // });

  // client.on('serverHeartbeatSucceeded', () => {
  //   console.debug('💓 MongoDB heartbeat succeeded');
  // });

  // client.on('connectionPoolCreated', () => {
  //   console.log('🔄 MongoDB connection pool created');
  // });

  // client.on('connectionPoolClosed', () => {
  //   console.log('🔌 MongoDB connection pool closed');
  // });

  // client.on('connectionPoolReady', () => {
  //   console.log('✅ MongoDB connection pool ready');
  // });

  // client.on('connectionPoolCleared', (event) => {
  //   console.warn('⚠️ MongoDB connection pool cleared');
  // });

  client.on('close', () => {
    // console.log('🔌 MongoDB connection closed');
    client = null;
    db = null;
  });
};

// Force close unhealthy connections
const forceCloseConnection = async (): Promise<void> => {
  if (!client) {
    db = null;
    isConnecting = false;
    return;
  }

  const clientToClose = client;
  client = null;
  db = null;
  isConnecting = false;

  try {
    console.log('🛑 Force closing MongoDB connection...');
    await clientToClose.close(true); // Force close
    // console.log('✅ MongoDB connection closed successfully');
  } catch (error) {
    console.error('❌ Error force closing MongoDB connection:', error instanceof Error ? error.message : 'Unknown error');
    throw error; // Re-throw to allow callers to handle the error
  }
};

// Connect to database with connection pooling and retry logic
export const connectToDatabase = async (): Promise<Db> => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('🔁 Connection attempt already in progress, waiting...');
    // Wait for existing connection attempt to complete
    let attempts = 0;
    const maxWaitTime = 5000; // Max 5 seconds to wait for existing connection
    const checkInterval = 100; // Check every 100ms

    while (isConnecting && attempts * checkInterval < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      attempts++;
    }

    if (isConnecting) {
      console.warn('⚠️ Previous connection attempt taking too long, starting new connection');
    }
  }

  // Check if existing connection is healthy
  if (client && db) {
    try {
      if (await isConnectionHealthy()) {
        console.log('♻️ Using existing healthy connection');
        return db;
      }
    } catch (error) {
      console.warn('⚠️ Existing connection health check failed, creating new connection');
    }
  }

  // Clean up any existing connection
  if (client || db) {
    console.log('🧹 Cleaning up existing connection...');
    await forceCloseConnection().catch(console.error);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const errorMsg = 'MONGODB_URI environment variable is not set';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  isConnecting = true;
  const connectionAttemptStart = Date.now();

  try {
    console.log('🔄 Attempting to connect to MongoDB...');

    // Create new client with optimized config
    client = new MongoClient(uri, CONNECTION_CONFIG);

    // Set up event listeners for monitoring
    setupConnectionEventListeners();

    // Connect with timeout
    const connectPromise = client.connect();
    const customConnectTimeout = 20000; // Give it 20s

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Connection timed out after ${customConnectTimeout}ms`)),
        customConnectTimeout
      )
    );
    await Promise.race([
      client.connect(),
      timeoutPromise
    ]);

    // Verify the connection by pinging the database
    db = client.db('pearl4nails');
    await db.command(
      { ping: 1 },
      {
        timeoutMS: 5000,  // 5 second timeout for the ping
        readPreference: 'primaryPreferred'
      }
    );

    const connectionTime = Date.now() - connectionAttemptStart;
    console.log(`✅ Successfully connected to MongoDB in ${connectionTime}ms`);

    return db;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ MongoDB connection failed after ${Date.now() - connectionAttemptStart}ms:`, errorMessage);

    // Clean up failed connection attempt
    await forceCloseConnection().catch(console.error);

    // Provide more detailed error information
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      throw new Error('Could not connect to MongoDB server. Please check if the server is running and accessible.');
    } else if (errorMessage.includes('Authentication failed')) {
      throw new Error('MongoDB authentication failed. Please check your credentials.');
    } else if (errorMessage.includes('timed out')) {
      throw new Error('Connection to MongoDB server timed out. Please check your network connection and try again.');
    } else {
      throw new Error(`MongoDB connection failed: ${errorMessage}`);
    }
  } finally {
    isConnecting = false;
  }
};

// Get appointments collection with aggressive retry and fast failure
export const getAppointmentCollection = async (): Promise<Collection> => {
  const maxRetries = 2;
  const retryDelay = 500; // Reduced from 1000ms

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const database = await connectToDatabase();
      const collection = database.collection('appointments');

      // Verify collection access with a quick operation
      await collection.estimatedDocumentCount({ maxTimeMS: 1000 });

      return collection;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Collection access attempt ${attempt} failed:`, errorMessage);

      if (attempt < maxRetries) {
        console.log(`🔄 Retrying in ${retryDelay}ms...`);
        await forceCloseConnection(); // Force clean connection state
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        throw new Error(`Failed to get collection after ${maxRetries} attempts: ${errorMessage}`);
      }
    }
  }

  throw new Error('Unexpected error in getAppointmentCollection');
};

// Optimized query function with built-in timeout and fallback
export const queryWithTimeout = async <T>(
  collection: Collection,
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
  );

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    // Clean up connection on query timeout
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('🧹 Cleaning up connection due to query timeout');
      forceCloseConnection().catch(console.error);
    }
    throw error;
  }
};

// Create indexes (run this once, maybe in a setup script)
export const createIndexes = async (): Promise<void> => {
  try {
    const collection = await getAppointmentCollection();

    // Create indexes with shorter timeout
    const indexOperations = [
      collection.createIndex(
        { date: 1, time: 1 },
        { background: true, name: 'date_time_idx', maxTimeMS: 10000 }
      ),
      collection.createIndex(
        { status: 1 },
        { background: true, name: 'status_idx', maxTimeMS: 10000 }
      ),
      collection.createIndex(
        { appointmentId: 1 },
        { background: true, name: 'appointmentId_idx', maxTimeMS: 10000 }
      )
    ];

    await Promise.all(indexOperations);
    // console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Index creation failed:', error instanceof Error ? error.message : 'Unknown error');
    // Don't throw - app can work without indexes
  }
};

// Close connection gracefully
export const closeConnection = async (): Promise<void> => {
  await forceCloseConnection();
  console.log('🔌 MongoDB connection closed gracefully');
};

// Test connection with timeout
export const testConnection = async (): Promise<boolean> => {
  try {
    const database = await connectToDatabase();
    await database.command({ ping: 1 }, { timeoutMS: 3000 });
    console.log('✅ MongoDB connection test passed');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`📴 Shutting down MongoDB connection due to ${signal}...`);
  await closeConnection();
  process.exit(0);
};

// Only set up handlers once
if (!process.env.MONGODB_HANDLERS_SET) {
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    gracefulShutdown('uncaughtException');
  });
  process.env.MONGODB_HANDLERS_SET = 'true';
}

// Helper function to format dates
export const formatDateForQuery = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // If already in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Convert other formats to YYYY-MM-DD
  return new Date(date).toISOString().split('T')[0];
};

// Health monitoring function for debugging
export const getConnectionStatus = (): object => {
  return {
    hasClient: !!client,
    hasDb: !!db,
    isConnecting,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  };
};