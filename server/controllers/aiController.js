const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const questionsData = require('../data/investigationQuestions.json');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateComplaintData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path;

    const { title, additionalDetails, locationMode, lat, lng, area, city, landmark } = req.body;

    // Fetch the image from Cloudinary to pass it directly to Gemini
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    let locationContext = 'Unknown';
    if (locationMode === 'current' && lat && lng) {
      locationContext = `Latitude: ${lat}, Longitude: ${lng}`;
    } else if (locationMode === 'manual') {
      locationContext = `Area/Street: ${area || ''}, City: ${city || ''}, Landmark: ${landmark || ''}`;
    }

    const prompt = `
Analyze this image and the provided context, then return a JSON object with the following schema exactly. Do not include markdown formatting, markdown blocks, explanations, or any extra text. Return ONLY raw valid JSON. Ensure all string values are properly escaped for valid JSON (e.g., escape double quotes inside strings).

Context:
- User-provided Title: ${title ? title.replace(/"/g, '\\"') : 'None provided'}
- Additional Details: ${additionalDetails ? additionalDetails.replace(/"/g, '\\"') : 'None provided'}
- Location: ${locationContext}

Schema:
{
  "title": "A short, descriptive title for the complaint",
  "description": "Detailed description of the issue in the image, incorporating additional details",
  "category": "One of: Infrastructure, Sanitation, Traffic, Other",
  "department": "The relevant government department",
  "priority": "Low, Medium, or High"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: req.file.mimetype || 'image/jpeg'
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    let resultText = response.text;
    // Strip possible markdown if model ignores responseMimeType
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Fix common missing closing brace from Gemini
    if (!resultText.endsWith('}')) {
      resultText += '\n}';
    }

    let parsedData;
    try {
      parsedData = JSON.parse(resultText);
    } catch (e) {
      console.error('JSON Parse Error. Raw Text from Gemini:', resultText);
      throw e;
    }
    
    parsedData.imageUrl = imageUrl;

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ message: 'Failed to analyze image' });
  }
};

const investigate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path;
    const { title, description, locationMode, lat, lng, area, city, landmark } = req.body;

    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    let locationContext = 'Unknown';
    if (locationMode === 'current' && lat && lng) {
      locationContext = `Latitude: ${lat}, Longitude: ${lng}`;
    } else if (locationMode === 'manual') {
      locationContext = `Area/Street: ${area || ''}, City: ${city || ''}, Landmark: ${landmark || ''}`;
    }

    const prompt = `
Analyze this image and context to detect the issue type and your confidence level.

Context:
- Title: ${title || 'None'}
- Description: ${description || 'None'}
- Location: ${locationContext}

Return ONLY a valid JSON object matching this schema exactly:
{
  "issueType": "one of: road_damage, garbage, drainage, streetlight, water_leak, or default",
  "confidence": "High, Medium, or Low",
  "reason": "Brief explanation of why you chose this issue type"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: req.file.mimetype || 'image/jpeg'
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    let resultText = response.text;
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!resultText.endsWith('}')) {
      resultText += '\n}';
    }

    const parsedData = JSON.parse(resultText);
    const category = parsedData.issueType || 'default';
    const questions = questionsData[category] || questionsData['default'];

    res.status(200).json({
      issueType: category,
      confidence: parsedData.confidence || 'Medium',
      questions,
      imageUrl
    });

  } catch (error) {
    console.error('AI Investigate Error:', error);
    res.status(500).json({ message: 'Failed to investigate image' });
  }
};

const finalizeComplaint = async (req, res) => {
  try {
    const { imageUrl, title, description, locationStr, answers } = req.body;
    
    // We expect answers to be a stringified JSON array of { question, answer }
    let parsedAnswers = [];
    try {
      if (answers) parsedAnswers = JSON.parse(answers);
    } catch(e) {}

    let answersText = parsedAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');

    let imageParts = [];
    if (imageUrl) {
      try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        imageParts = [{
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }];
      } catch (e) {
        console.error('Failed to fetch image for finalization', e);
      }
    }

    const prompt = `
Generate a final civic complaint report based on the initial details, the provided image (if any), and the user's answers during the AI investigation.

Original Title: ${title || 'None'}
Original Description: ${description || 'None'}
Location Data: ${locationStr || 'None'}

User Investigation Answers:
${answersText || 'None'}

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "A short, professional, highly descriptive title for the complaint",
  "description": "A comprehensive description synthesizing the visual evidence and the user's answers into a clear report",
  "category": "Infrastructure, Sanitation, Traffic, Utilities, or Other",
  "department": "The relevant government department",
  "priority": "Low, Medium, or High",
  "severity": "Low, Medium, High, or Critical",
  "estimatedImpact": "A short phrase describing who/what is impacted",
  "recommendedAction": "A brief actionable recommendation for the resolving officer"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    let resultText = response.text;
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!resultText.endsWith('}')) {
      resultText += '\n}';
    }

    const parsedData = JSON.parse(resultText);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('AI Finalize Error:', error);
    res.status(500).json({ message: 'Failed to finalize complaint' });
  }
};

module.exports = {
  generateComplaintData,
  investigate,
  finalizeComplaint
};
