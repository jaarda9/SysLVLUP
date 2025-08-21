import { MongoClient } from 'mongodb';

// Environment variable for MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('userData');

    if (req.method === 'POST') {
      const { userId, localStorageData } = req.body;

      if (!userId || !localStorageData) {
        return res.status(400).json({ error: 'Missing userId or localStorageData' });
      }

      const result = await collection.updateOne(
        { userId: userId },
        { 
          $set: { 
            localStorage: localStorageData,
            lastUpdated: new Date()
          } 
        },
        { upsert: true }
      );

      res.status(200).json({ 
        success: true, 
        message: 'LocalStorage data synced successfully',
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId
      });

    } else if (req.method === 'GET') {
  
      const userDoc = await collection.findOne({ userId: "your-user-id" });
      
      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Found the user, return their localStorage data
      res.status(200).json({ localStorageData: userDoc.localStorage });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}



