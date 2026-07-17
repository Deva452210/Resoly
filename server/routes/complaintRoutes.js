const express = require('express');
const router = express.Router();
const { uploadVideo } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  verifyComplaint,
} = require('../controllers/complaintController');

// POST /api/complaints - Create a complaint (optional video)
router.post('/', protect, uploadVideo.single('video'), createComplaint);

// GET /api/complaints - Get all complaints
router.get('/', getComplaints); // Public or protect? The prompt says "Public feed" for the feed, but only authenticated users usually view it if it's protected route in App.js. Let's leave it public for now, the UI protects it anyway.

// GET /api/complaints/:id - Get single complaint
router.get('/:id', protect, getComplaintById);

// POST /api/complaints/:id/verify - Verify complaint resolution
router.post('/:id/verify', protect, verifyComplaint);

module.exports = router;
