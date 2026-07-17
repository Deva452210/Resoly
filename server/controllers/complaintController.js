const Complaint = require('../models/Complaint');

// Create a new complaint
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, department, priority, imageUrl, locationStr } = req.body;
    let videoUrl = null;
    if (req.file) {
      videoUrl = req.file.path; // Cloudinary video URL
    }

    const location = locationStr ? JSON.parse(locationStr) : {};

    const newComplaint = new Complaint({
      title,
      description,
      category,
      department,
      priority,
      imageUrl,
      videoUrl,
      location,
      createdBy: req.user._id, // Set by protect middleware
      status: 'Reported',
      aiGenerated: true,
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Failed to create complaint', error: error.message });
  }
};

// Get all complaints (newest first)
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role'); // Populate reporter details
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// Get single complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('resolution.resolvedBy', 'name email role');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    res.status(500).json({ message: 'Failed to fetch complaint details' });
  }
};

const verifyComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can verify complaints' });
    }

    const { vote } = req.body;
    if (vote !== 'solved' && vote !== 'not_solved') {
      return res.status(400).json({ message: 'Invalid vote value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Only resolved complaints can be verified' });
    }

    if (complaint.verification.verifiedUsers.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already verified this complaint' });
    }

    if (vote === 'solved') {
      complaint.verification.solvedVotes += 1;
    } else {
      complaint.verification.notSolvedVotes += 1;
    }

    complaint.verification.verifiedUsers.push(req.user._id);

    // AI Escalation Logic
    if (complaint.verification.notSolvedVotes >= 3 && !complaint.escalation.generated) {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
Generate a formal escalation report for a civic complaint that was marked as 'Resolved' by an officer, but rejected by citizens as 'not solved'.

Complaint Details:
- Title: ${complaint.title}
- Original Description: ${complaint.description}
- Category: ${complaint.category}
- Department: ${complaint.department}

Officer's Resolution Notes:
${complaint.resolution.notes || 'None provided'}

Write a concise, professional 3-paragraph escalation report requesting higher-level administrative review of this issue. Do not use markdown blocks.
      `;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt
        });
        
        complaint.escalation.report = response.text.replace(/```markdown/g, '').replace(/```/g, '').trim();
        complaint.escalation.generated = true;
        complaint.escalation.generatedAt = new Date();
      } catch (aiError) {
        console.error('Failed to generate AI escalation report:', aiError);
        // Continue saving the vote even if AI fails
      }
    }

    const updatedComplaint = await complaint.save();
    
    // Return populated complaint
    const populatedComplaint = await Complaint.findById(updatedComplaint._id)
      .populate('createdBy', 'name email role')
      .populate('resolution.resolvedBy', 'name email role');

    res.status(200).json(populatedComplaint);
  } catch (error) {
    console.error('Error verifying complaint:', error);
    res.status(500).json({ message: 'Failed to verify complaint' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  verifyComplaint,
};
