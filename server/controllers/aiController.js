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

module.exports = {
  generateComplaintData,
};
