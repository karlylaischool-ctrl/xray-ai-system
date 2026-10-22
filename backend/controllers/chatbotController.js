const axios = require('axios');

exports.askChatbot = async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }
    
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'Google Cloud API key not configured' });
    }
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = context 
      ? `As a helpful medical assistant for patient education, answer this question about their X-ray report: ${question}\n\nContext: ${context}\n\nProvide a simple, easy-to-understand explanation suitable for a layperson. Always include a disclaimer that this is for educational purposes only and patients should consult their doctor for medical advice.`
      : `As a helpful medical assistant for patient education, answer this question: ${question}\n\nProvide a simple, easy-to-understand explanation suitable for a layperson. Always include a disclaimer that this is for educational purposes only and patients should consult their doctor for medical advice.`;
    
    const response = await axios.post(endpoint, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });
    
    const answer = response.data.candidates[0].content.parts[0].text;
    
    res.json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to get response from chatbot',
      error: error.response?.data || error.message 
    });
  }
};
