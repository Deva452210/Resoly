const express = require('express');
const router = express.Router();
const { protect, officer } = require('../middleware/authMiddleware');
const {
  getOfficerComplaints,
  getOfficerComplaintById,
  updateComplaintStatus,
} = require('../controllers/officerController');

// All routes here are protected and require the officer role
router.use(protect, officer);

router.get('/complaints', getOfficerComplaints);
router.get('/complaints/:id', getOfficerComplaintById);
router.patch('/complaints/:id/status', updateComplaintStatus);

module.exports = router;
