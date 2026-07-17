const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

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
Analyze this image and the provided context, then return a JSON object with the following schema exactly. Do not include markdown formatting, markdown blocks, explanations, or any extra text. Return ONLY raw valid JSON.

Context:
- User-provided Title: ${title || 'None provided'}
- Additional Details: ${additionalDetails || 'None provided'}
- Location: ${locationContext}

Schema:
{
  "title": "A short, descriptive title for the complaint (use user-provided title if appropriate)",
  "description": "Detailed description of the issue in the image, incorporating additional details",
  "category": "One of: Infrastructure, Sanitation, Traffic, Other",
  "department": "The relevant government department",
  "priority": "Low, Medium, or High"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const parsedData = JSON.parse(resultText);
    parsedData.imageUrl = imageUrl;

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ message: 'Failed to analyze image' });
  }
};

module.exports = {
  generateComplaintData,
};
