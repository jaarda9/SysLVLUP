const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Environment variable for MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    if (req.method === 'GET') {
      // Get user data by userId
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }

      const userData = await db.collection('userData').findOne({ userId });

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

    } else if (req.method === 'POST') {
      // Handle authentication requests
      const { action, email, password, token } = req.body;

      if (action === 'register') {
        // User registration
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const user = {
          userId: userId,
          email: email.toLowerCase(),
          password: hashedPassword,
          createdAt: new Date()
        };

        await db.collection('users').insertOne(user);

        // Generate JWT token
        const jwtToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token: jwtToken,
          userId: user.userId
        });

      } else if (action === 'login') {
        // User login
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const jwtToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
          success: true,
          message: 'Login successful',
          token: jwtToken,
          userId: user.userId
        });

      } else if (action === 'verify-token') {
        // Token verification
        if (!email || !token) {
          return res.status(400).json({ error: 'Email and token are required' });
        }

        // Verify token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
          }

          if (decoded.email !== email.toLowerCase()) {
            return res.status(401).json({ error: 'Token does not match email' });
          }

          res.status(200).json({ success: true, message: 'Token is valid' });
        });

      } else if (action === 'device-link') {
        // Device linking
        const { userId, email } = req.body;

        if (!userId || !email) {
          return res.status(400).json({ error: 'User ID and email are required' });
        }

        // Find user
        const user = await db.collection('users').findOne({ 
          userId: userId, 
          email: email.toLowerCase() 
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Generate new token for device
        const jwtToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
          success: true,
          message: 'Device linked successfully',
          token: jwtToken,
          userId: user.userId
        });

      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
