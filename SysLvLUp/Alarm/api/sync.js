const { MongoClient } = require('mongodb');

// Environment variable for MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    const { userId, localStorageData } = req.body;

    if (!userId || !localStorageData) {
      return res.status(400).json({ error: 'Missing userId or localStorageData' });
    }

    await client.connect();
    const db = client.db();
    
    // Create or update the user's localStorage data
    const result = await db.collection('userData').updateOne(
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

  } catch (err) {
    console.error('Error syncing localStorage:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
