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

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
};
