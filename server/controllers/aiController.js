const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const questionsData = require('../data/investigationQuestions.json');
const Complaint = require('../models/Complaint');
const ExecutiveSummary = require('../models/ExecutiveSummary');
const CivicIntelligence = require('../models/CivicIntelligence');

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

const auditResolution = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No after image uploaded' });
    }

    const afterImageUrl = req.file.path;
    const { beforeImageUrl, notes, issueType } = req.body;

    if (!beforeImageUrl) {
      return res.status(400).json({ message: 'Missing before image URL' });
    }

    // Fetch both images
    const [beforeRes, afterRes] = await Promise.all([
      axios.get(beforeImageUrl, { responseType: 'arraybuffer' }),
      axios.get(afterImageUrl, { responseType: 'arraybuffer' })
    ]);

    const beforeBuffer = Buffer.from(beforeRes.data, 'binary');
    const afterBuffer = Buffer.from(afterRes.data, 'binary');

    const prompt = `
You are an expert AI Resolution Auditor. Compare the "Before" image and the "After" image of this civic issue.
Issue Type: ${issueType || 'Unknown'}
Officer's Resolution Notes: ${notes || 'None provided'}

Assess the quality of the repair/resolution.
Return ONLY a valid JSON object matching this exact schema:
{
  "confidence": "High, Medium, or Low (how confident are you in this assessment)",
  "status": "Adequate, Inadequate, or Unclear",
  "summary": "A 1-2 sentence summary comparing the before and after state",
  "improvements": "What was successfully fixed?",
  "remainingIssues": "What was missed or still looks damaged?",
  "recommendation": "A brief recommendation for final approval or rework"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { text: "Before Image:" },
            {
              inlineData: {
                data: beforeBuffer.toString('base64'),
                mimeType: 'image/jpeg'
              }
            },
            { text: "After Image:" },
            {
              inlineData: {
                data: afterBuffer.toString('base64'),
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
    res.status(200).json({
      ...parsedData,
      afterImageUrl // return the URL so the frontend can display it or send it back for saving
    });

  } catch (error) {
    console.error('AI Audit Error:', error);
    res.status(500).json({ message: 'Failed to audit resolution' });
  }
};

const getLatestExecutiveSummary = async (req, res) => {
  try {
    const summary = await ExecutiveSummary.findOne().sort({ generatedAt: -1 });
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    res.status(500).json({ message: 'Failed to fetch executive summary' });
  }
};

const generateExecutiveSummary = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('resolution.resolvedBy', 'name');
    
    // Condense the data to save tokens
    const complaintData = complaints.map(c => ({
      status: c.status,
      category: c.category,
      department: c.department,
      priority: c.priority,
      votes: c.verification ? c.verification.solvedVotes - c.verification.notSolvedVotes : 0,
      escalated: c.status === 'Escalated',
      resolved: c.status === 'Resolved',
      aiAuditStatus: c.aiAudit ? c.aiAudit.status : null,
      resolvedBy: c.resolution?.resolvedBy?.name || 'Unassigned'
    }));

    const prompt = `
You are an expert AI Executive Assistant for a city's Higher Authority dashboard.
Analyze the following summary of all civic complaints in the system and generate an Executive Brief.

Complaint Data (JSON array):
${JSON.stringify(complaintData)}

Return ONLY a valid JSON object matching this exact schema:
{
  "greeting": "A short, professional greeting (e.g. 'Good morning, Director. Here is your system overview.')",
  "summary": "A 2-3 sentence high-level summary of the current system health and major bottlenecks",
  "highlights": [
    "Highlight 1 (e.g. 'Garbage collection has a high resolution rate.')",
    "Highlight 2 (e.g. 'Road damage complaints are frequently escalating.')",
    "Highlight 3"
  ],
  "recommendation": "A single strong recommendation for the authority to take action on"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    let resultText = response.text;
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Fallback parsing: extract everything between first { and last }
    const match = resultText.match(/\{[\s\S]*\}/);
    if (match) {
      resultText = match[0];
    } else if (!resultText.endsWith('}')) {
      resultText += '\n}';
    }

    const parsedData = JSON.parse(resultText);

    const newSummary = await ExecutiveSummary.create({
      greeting: parsedData.greeting,
      summary: parsedData.summary,
      highlights: parsedData.highlights,
      recommendation: parsedData.recommendation
    });

    res.status(200).json(newSummary);

  } catch (error) {
    console.error('Error generating executive summary:', error);
    res.status(500).json({ message: 'Failed to generate executive summary' });
  }
};

const getLatestCivicIntelligence = async (req, res) => {
  try {
    const report = await CivicIntelligence.findOne().sort({ generatedAt: -1 });
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching civic intelligence:', error);
    res.status(500).json({ message: 'Failed to fetch civic intelligence' });
  }
};

const generateCivicIntelligence = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('resolution.resolvedBy', 'name');
    
    // Condense the data for Gemini to see systemic relationships
    const complaintData = complaints.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category,
      department: c.department,
      priority: c.priority,
      status: c.status,
      location: c.location?.area || c.location?.city || 'Unknown',
      date: c.createdAt
    }));

    const prompt = `
You are an advanced AI Civic Intelligence Engine. Your job is to analyze all civic complaints holistically and identify meaningful relationships, patterns, systemic risks, and root causes.

Complaint Data (JSON array):
${JSON.stringify(complaintData)}

Return ONLY a valid JSON object matching this exact schema:
{
  "criticalAlerts": ["Alert 1 (e.g. 'Multiple water leaks reported in Downtown area indicating failing pipes')", "Alert 2"],
  "relatedComplaints": [
    {
      "pattern": "String describing the relationship/pattern",
      "complaints": [
        { "id": "complaint_id", "title": "Complaint Title" }
      ]
    }
  ],
  "possibleRootCauses": ["Cause 1", "Cause 2"],
  "recommendations": [
    {
      "action": "String detailing the recommended systemic action",
      "linkedComplaints": [
        { "id": "complaint_id", "title": "Complaint Title" }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    let resultText = response.text;
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Fallback parsing: extract everything between first { and last }
    const match = resultText.match(/\{[\s\S]*\}/);
    if (match) {
      resultText = match[0];
    } else if (!resultText.endsWith('}')) {
      resultText += '\n}';
    }

    const parsedData = JSON.parse(resultText);

    const newReport = await CivicIntelligence.create({
      criticalAlerts: parsedData.criticalAlerts || [],
      relatedComplaints: parsedData.relatedComplaints || [],
      possibleRootCauses: parsedData.possibleRootCauses || [],
      recommendations: parsedData.recommendations || []
    });

    res.status(200).json(newReport);

  } catch (error) {
    console.error('Error generating civic intelligence:', error);
    res.status(500).json({ message: 'Failed to generate civic intelligence' });
  }
};

module.exports = {
  generateComplaintData,
  investigate,
  finalizeComplaint,
  auditResolution,
  getLatestExecutiveSummary,
  generateExecutiveSummary,
  getLatestCivicIntelligence,
  generateCivicIntelligence
};
