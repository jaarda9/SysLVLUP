const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
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
    // Test MongoDB connection
    await client.connect();
    const db = client.db();
    
    // Test database operations
    const collections = await db.listCollections().toArray();
    const userDataCount = await db.collection('userData').countDocuments();
    
    res.status(200).json({ 
      status: 'healthy',
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: collections.map(col => col.name),
      userDataCount: userDataCount,
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    await client.close();
  }
}
