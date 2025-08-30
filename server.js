const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

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
  res.sendFile(path.join(__dirname, 'index.html'));
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

// Gemini API endpoint for Research Training
app.get('/api/gemini', async (req, res) => {
    const { action } = req.query;
    
    if (action === 'generate-topic') {
        try {
            const GEMINI_API_KEY = 'AIzaSyAtL-nZJQ_rBdK72qvn5ocgbf6bgUPlgNo';
            const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
            
            const categories = [
                'Humanities (History, Literature, Philosophy, Art)',
                'Social Sciences (Geography, Political Science, Sociology, Economics)',
                'Science and Technology (Physics, Biology, Computer Science, Engineering)',
                'Current Events (Business, Politics, Technology News, Global Affairs)'
            ];
            
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            
            const prompt = `Generate a daily cultural learning topic from this category: ${randomCategory}

Please provide a response in this exact JSON format:
{
  "category": "Category Name",
  "title": "Topic Title",
  "description": "A brief but engaging description of the topic that would interest someone learning about it",
  "difficulty": "Beginner/Intermediate/Advanced"
}

Make the topic interesting and educational. Keep the description concise but informative.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            console.log('Gemini API Response:', JSON.stringify(data, null, 2));
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const generatedText = data.candidates[0].content.parts[0].text;
                
                // Try to extract JSON from the response
                try {
                    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const topicData = JSON.parse(jsonMatch[0]);
                        return res.json({
                            success: true,
                            topic: topicData,
                            generatedAt: new Date().toISOString()
                        });
                    }
                } catch (parseError) {
                    console.error('Failed to parse JSON from Gemini response:', parseError);
                }
                
                // Fallback: create topic from text
                return res.json({
                    success: true,
                    topic: {
                        category: randomCategory,
                        title: "Daily Learning Topic",
                        description: generatedText.substring(0, 200) + "...",
                        difficulty: "Intermediate"
                    },
                    generatedAt: new Date().toISOString()
                });
            } else {
                console.error('Invalid Gemini response structure:', data);
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // Return a fallback topic instead of error
            return res.json({
                success: true,
                topic: {
                    category: "Humanities",
                    title: "Ancient Egyptian Architecture",
                    description: "Explore the magnificent pyramids, temples, and monuments of ancient Egypt. Learn about the construction techniques, religious significance, and cultural impact of these architectural marvels.",
                    difficulty: "Intermediate"
                },
                generatedAt: new Date().toISOString(),
                fallback: true
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            error: 'Invalid action'
        });
    }
});

app.post('/api/gemini', async (req, res) => {
    const { action, topic } = req.body;
    
    if (action === 'generate-quiz') {
        try {
            const GEMINI_API_KEY = 'AIzaSyAtL-nZJQ_rBdK72qvn5ocgbf6bgUPlgNo';
            const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
            
            const prompt = `Create 5 engaging quiz questions about: ${topic.title} - ${topic.description}

Please provide a response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "question": "True or false question here?",
      "type": "true_false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Brief explanation"
    }
  ]
}

Mix question types: multiple choice, true/false, and fill-in-the-blank. Make questions engaging and educational. Keep explanations concise.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const generatedText = data.candidates[0].content.parts[0].text;
                
                // Try to extract JSON from the response
                try {
                    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const quizData = JSON.parse(jsonMatch[0]);
                        return res.json({
                            success: true,
                            quiz: quizData.questions || [],
                            generatedAt: new Date().toISOString()
                        });
                    }
                } catch (parseError) {
                    console.error('Failed to parse JSON from Gemini response:', parseError);
                }
                
                // Fallback: create basic quiz
                return res.json({
                    success: true,
                    quiz: [
                        {
                            question: "What is the main topic of today's lesson?",
                            type: "multiple_choice",
                            options: ["Option A", "Option B", "Option C", "Option D"],
                            correctAnswer: "Option A",
                            explanation: "This is the correct answer based on the topic."
                        }
                    ],
                    generatedAt: new Date().toISOString()
                });
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to generate quiz',
                details: error.message
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            error: 'Invalid action'
        });
    }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST /api/sync - Sync localStorage data');
    console.log('  GET  /api/user/:userId - Get user data');
    console.log('  GET  /api/gemini?action=generate-topic - Generate daily topic');
    console.log('  POST /api/gemini - Generate quiz questions');
  });
});
