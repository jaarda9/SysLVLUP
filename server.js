const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'SysLvLUp', 'Alarm')));

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedata';

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'SysLvLUp', 'Alarm', 'index.html'));
});

// Sync localStorage data endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const { userId, localStorageData } = req.body;

    if (!userId || !localStorageData) {
      return res.status(400).json({ error: 'Missing userId or localStorageData' });
    }

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
  }
});

// Get user data endpoint
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await db.collection('userData').findOne({ userId });
    
    if (!userData) {
      return res.status(404).json({ error: 'User data not found' });
    }

    res.status(200).json(userData);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
