const { MongoClient } = require('mongodb');

// Environment variable for MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    await client.connect();
    const db = client.db();
    
    // Find user data by userId
    const userData = await db.collection('userData').findOne(
      { userId: userId }
    );

    if (!userData) {
      return res.status(404).json({ 
        error: 'User not found',
        localStorage: {}
      });
    }

    res.status(200).json({
      success: true,
      userId: userData.userId,
      localStorage: userData.localStorage || {},
      lastUpdated: userData.lastUpdated
    });

  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
