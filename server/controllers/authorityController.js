const Complaint = require('../models/Complaint');

// Get all complaints for authority dashboard
const getAuthorityComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role')
      .populate('resolution.resolvedBy', 'name email role');
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching authority complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// Get single complaint for authority
const getAuthorityComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('resolution.resolvedBy', 'name email role');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error fetching authority complaint details:', error);
    res.status(500).json({ message: 'Failed to fetch complaint details' });
  }
};

module.exports = {
  getAuthorityComplaints,
  getAuthorityComplaintById,
};
