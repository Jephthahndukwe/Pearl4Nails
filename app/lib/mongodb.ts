import { MongoClient, ObjectId } from 'mongodb';

// Initialize MongoDB client
let client: MongoClient;
let db: any;

export const connectToDatabase = async () => {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI || '', {
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        },
      });
      await client.connect();
      db = client.db('pearl4nails');
      console.log('Connected to MongoDB');
    }
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export const getAppointmentCollection = async () => {
  try {
    const database = await connectToDatabase();
    const collection = database.collection('appointments');
    
    // Create indexes if they don't exist
    await collection.createIndex({ date: 1, time: 1, status: 1 }, { unique: false });
    await collection.createIndex({ status: 1 });
    
    // Ensure all dates are in the correct format
    await collection.updateMany(
      {},
      [{
        $set: {
          date: {
            $cond: {
              if: { $type: "$date" },
              then: "$date",
              else: { $dateFromString: { dateString: "$date" } }
            }
          }
        }
      }]
    );

    // Normalize existing data
    await collection.updateMany(
      {},
      [{
        $set: {
          status: {
            $cond: {
              if: { $eq: ["$status", "confirmed"] },
              then: "confirmed",
              else: {
                $cond: {
                  if: { $eq: ["$status", "cancelled"] },
                  then: "cancelled",
                  else: "pending"
                }
              }
            }
          }
        }
      }]
    );

    return collection;
  } catch (error) {
    console.error('Error getting appointment collection:', error);
    throw error;
  }
};

// Helper function to format date for queries
export const formatDateForQuery = (date: string | Date): string => {
  if (date instanceof Date) {
    // Get year, month, day components in local time
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
      // Convert MM/DD/YYYY to YYYY-MM-DD
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    
    // Last resort - create date object but handle it carefully
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Default fallback
  return new Date().toISOString().split('T')[0];
};
