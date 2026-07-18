const Complaint = require('../models/Complaint');

// Create a new complaint
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, department, priority, severity, imageUrl, locationStr, aiInvestigation } = req.body;
    let videoUrl = null;
    if (req.file) {
      videoUrl = req.file.path; // Cloudinary video URL
    }

    const location = locationStr ? JSON.parse(locationStr) : {};
    
    let parsedAiInvestigation;
    if (aiInvestigation) {
      try {
        parsedAiInvestigation = JSON.parse(aiInvestigation);
      } catch (e) {
        console.error('Error parsing aiInvestigation:', e);
      }
    }

    const newComplaint = new Complaint({
      title,
      description,
      category,
      department,
      priority,
      severity,
      imageUrl,
      videoUrl,
      location,
      aiInvestigation: parsedAiInvestigation,
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

    if (complaint.status !== 'Resolved' && complaint.status !== 'Escalated') {
      return res.status(400).json({ message: 'Only resolved complaints can be verified' });
    }

    const userIdStr = req.user._id.toString();
    const existingVoteIndex = complaint.verification.votes.findIndex(v => v.user.toString() === userIdStr);

    if (existingVoteIndex !== -1) {
      const existingVote = complaint.verification.votes[existingVoteIndex].vote;
      
      // If vote is the same, do nothing
      if (existingVote === vote) {
        return res.status(200).json(complaint);
      }

      // Update the vote
      complaint.verification.votes[existingVoteIndex].vote = vote;

      // Adjust counts
      if (vote === 'solved') {
        complaint.verification.solvedVotes += 1;
        complaint.verification.notSolvedVotes -= 1;
      } else {
        complaint.verification.notSolvedVotes += 1;
        complaint.verification.solvedVotes -= 1;
      }
    } else {
      // New vote
      complaint.verification.votes.push({ user: req.user._id, vote });
      if (vote === 'solved') {
        complaint.verification.solvedVotes += 1;
      } else {
        complaint.verification.notSolvedVotes += 1;
      }
    }

    // AI Escalation Logic (Hackathon rule: >= 1 Not Solved)
    if (complaint.verification.notSolvedVotes >= 1 && !complaint.escalation.generated) {
      complaint.status = 'Escalated';
      
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

Write a very short, concise, single-paragraph escalation alert requesting higher-level administrative review of this issue. Get straight to the point. Maximum 3-4 sentences. Do not use markdown blocks.
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
