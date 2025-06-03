import { MongoClient, ObjectId, ReadPreference } from 'mongodb';

// Global connection variables
let client: MongoClient | null = null;
let db: any = null;
let isConnecting = false;

// Connection configuration
const CONNECTION_CONFIG = {
  // Connection attempts
  maxRetries: 3,
  baseRetryDelay: 1000,
  maxRetryDelay: 5000,
  
  // Timeout settings
  connectTimeoutMS: 10000,     // 10 seconds
  socketTimeoutMS: 30000,      // 30 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  
  // Connection pool settings
  maxPoolSize: 5,
  minPoolSize: 1,
  maxIdleTimeMS: 10000,
  waitQueueTimeoutMS: 10000,
  
  // Heartbeat and monitoring
  heartbeatFrequencyMS: 10000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Network settings
  family: 4,  // Force IPv4
  
  // Keep alive settings
  keepAlive: true,
  keepAliveInitialDelay: 30000,  // 30 seconds
  
  // TLS/SSL settings
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Replica set and authentication
  replicaSet: 'atlas-14pz4k-shard-0',
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-1',
  
  // Read preference
  readPreference: 'primary',
  
  // Write concern
  w: 'majority',
  wtimeout: 10000
};

// Helper function to sleep with exponential backoff
const sleep = (attempt: number) => {
  const delay = Math.min(
    CONNECTION_CONFIG.baseRetryDelay * Math.pow(2, attempt),
    CONNECTION_CONFIG.maxRetryDelay
  );
  console.log(`Waiting ${delay}ms before retry...`);
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Function to validate MongoDB URI format
const isValidMongoURI = (uri: string): boolean => {
  try {
    const url = new URL(uri);
    return url.protocol === 'mongodb:' || url.protocol === 'mongodb+srv:';
  } catch (e) {
    return false;
  }
};

// Close existing connection
const closeConnection = async () => {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    } finally {
      client = null;
      db = null;
      isConnecting = false;
    }
  }
};

export const connectToDatabase = async (): Promise<{db: any; client: MongoClient}> => {
  // If we already have a healthy connection, return it
  if (client && db) {
    try {
      // Quick ping to verify connection is still alive
      await client.db('admin').command({ ping: 1 }, { maxTimeMS: 2000 });
      console.log('Using existing MongoDB connection');
      return { db, client };
    } catch (error) {
      console.warn('Existing connection is stale, reconnecting...', error);
      await closeConnection();
    }
  }
  
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('Connection attempt already in progress, waiting...');
    // Wait for the ongoing connection attempt
    let attempts = 0;
    const MAX_WAIT_ATTEMPTS = 30; // 3 seconds total wait (30 * 100ms)
    while (isConnecting && attempts < MAX_WAIT_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      
      // If connection was established by another process
      if (client && db) {
        console.log(`Reusing connection after waiting ${attempts * 100}ms`);
        return { db, client };
      }
    }
    
    if (client && db) {
      return { db, client };
    }
    
    console.warn('Timed out waiting for existing connection attempt');
  }
  
  isConnecting = true;
  
  try {
    const uri = process.env.MONGODB_URI?.trim() || '';
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    if (!isValidMongoURI(uri)) {
      throw new Error('Invalid MongoDB URI format');
    }

    // Log connection attempt (without credentials)
    const safeUri = uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1***:***@');
    console.log(`Connecting to MongoDB: ${safeUri}`);
    
    // Minimal connection options for maximum compatibility
    const options = {
      // Basic connection settings
      connectTimeoutMS: 10000, // 10 seconds to establish connection
      socketTimeoutMS: 30000,  // 30 seconds for socket operations
      
      // Connection pool settings
      maxPoolSize: 5,          // Maximum number of connections in the pool
      
      // Read preferences
      readPreference: 'primary' as const, // Use 'primary' for better compatibility
      
      // Application name for monitoring
      appName: 'Pearl4Nails-WebApp',
      
      // TLS/SSL options - keep it simple
      tls: true,
      
      // Network settings - use IPv4
      family: 4,
      
      // Authentication
      authSource: 'admin'
    };
    
    console.log(`Connection attempt started at ${new Date().toISOString()}`);
    
    // Create new client and connect
    const newClient = new MongoClient(uri, options);
    
    try {
      console.log('Connecting to MongoDB...');
      
      // Simple connection with timeout
      await Promise.race([
        newClient.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);
      
      // Get the database
      const newDb = newClient.db('pearl4nails');
      
      // Verify connection with a simple query
      await newDb.command({ ping: 1 });
      console.log('✅ Successfully connected to MongoDB');
      
      // Update global connection variables
      client = newClient;
      db = newDb;
      
      return { db, client };
      
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      
      // Close client if connection failed
      try {
        await newClient.close();
      } catch (closeError) {
        console.warn('Error closing failed connection:', closeError);
      }
      
      throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

export const getAppointmentCollection = async () => {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('appointments');
    
    // Create indexes if they don't exist (with shorter timeout)
    try {
      await Promise.race([
        collection.createIndex({ date: 1, time: 1, status: 1 }, { unique: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Index creation timeout')), 5000))
      ]);
      
      await Promise.race([
        collection.createIndex({ status: 1 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Index creation timeout')), 5000))
      ]);
    } catch (indexError) {
      console.warn('Index creation failed or timed out:', indexError);
      // Continue without indexes - they're not critical for basic functionality
    }

    return collection;
  } catch (error) {
    console.error('Error getting appointment collection:', error);
    throw error;
  }
};

// Helper function to format date for queries
export const formatDateForQuery = (date: string | Date): string => {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // Handle MM/DD/YYYY format
    const parts = date.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    
    // Last resort - create date object
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return new Date().toISOString().split('T')[0];
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

// Add this function after the existing functions
export const testConnection = async (): Promise<{ success: boolean; message: string; latency?: number }> => {
  const startTime = Date.now();
  
  try {
    const { client } = await connectToDatabase();
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // Test a simple operation
    await client.db('pearl4nails').collection('test').findOne({});
    
    return {
      success: true,
      message: `Connection successful`,
      latency
    };
  } catch (error) {
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
      latency
    };
  }
};