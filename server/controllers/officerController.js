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
      .populate('createdBy', 'name email role')
      .populate('resolution.resolvedBy', 'name email role');
    
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

// Resolve complaint with photo and notes
const resolveComplaint = async (req, res) => {
  try {
    const { notes, afterImageUrl: existingAfterImageUrl, aiAudit } = req.body;
    let afterImageUrl = existingAfterImageUrl || null;
    
    if (req.file) {
      afterImageUrl = req.file.path; // Cloudinary image URL
    }

    if (!afterImageUrl || !notes) {
      return res.status(400).json({ message: 'After photo and resolution notes are required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    complaint.resolution = {
      afterImageUrl,
      notes,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };

    if (aiAudit) {
      try {
        const parsedAudit = JSON.parse(aiAudit);
        parsedAudit.auditedAt = new Date();
        complaint.aiAudit = parsedAudit;
      } catch (e) {
        console.error('Failed to parse aiAudit', e);
      }
    }

    const updatedComplaint = await complaint.save();
    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Failed to resolve complaint' });
  }
};

module.exports = {
  getOfficerComplaints,
  getOfficerComplaintById,
  updateComplaintStatus,
  resolveComplaint,
};
