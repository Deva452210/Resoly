const Complaint = require('../models/Complaint');

// Get all complaints for officer dashboard
const getOfficerComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching officer complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// Get single complaint for officer
const getOfficerComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email role');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error fetching officer complaint:', error);
    res.status(500).json({ message: 'Failed to fetch complaint details' });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const allowedStatuses = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

module.exports = {
  getOfficerComplaints,
  getOfficerComplaintById,
  updateComplaintStatus,
};
