// Vercel serverless function for Gemini AI integration
export default async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GEMINI_API_KEY = 'AIzaSyAtL-nZJQ_rBdK72qvn5ocgbf6bgUPlgNo';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  try {
    if (req.method === 'GET' && req.query.action === 'generate-topic') {
      // Generate daily topic
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
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Try to extract JSON from the response
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const topicData = JSON.parse(jsonMatch[0]);
            return res.status(200).json({
              success: true,
              topic: topicData,
              generatedAt: new Date().toISOString()
            });
          }
        } catch (parseError) {
          console.error('Failed to parse JSON from Gemini response:', parseError);
        }
        
        // Fallback: create topic from text
        return res.status(200).json({
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
    }

    if (req.method === 'POST' && req.body.action === 'generate-quiz') {
      // Generate quiz questions
      const { topic } = req.body;
      
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
            return res.status(200).json({
              success: true,
              quiz: quizData.questions || [],
              generatedAt: new Date().toISOString()
            });
          }
        } catch (parseError) {
          console.error('Failed to parse JSON from Gemini response:', parseError);
        }
        
        // Fallback: create basic quiz
        return res.status(200).json({
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
    }

    return res.status(400).json({ 
      success: false, 
      error: 'Invalid request method or action' 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
}
