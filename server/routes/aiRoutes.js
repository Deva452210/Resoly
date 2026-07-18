const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { 
  generateComplaintData, 
  investigate, 
  finalizeComplaint, 
  auditResolution,
  getLatestExecutiveSummary,
  generateExecutiveSummary,
  getLatestCivicIntelligence,
  generateCivicIntelligence,
  askAiCommandCenter
} = require('../controllers/aiController');
const { upload } = require('../config/cloudinary');

router.post('/generate', protect, upload.single('image'), generateComplaintData);
router.post('/investigate', protect, upload.single('image'), investigate);
router.post('/finalize-complaint', protect, upload.none(), finalizeComplaint);
router.post('/audit-resolution', protect, upload.single('afterImage'), auditResolution);

router.get('/executive-summary', protect, getLatestExecutiveSummary);
router.post('/executive-summary', protect, generateExecutiveSummary);

router.get('/civic-intelligence', protect, getLatestCivicIntelligence);
router.post('/civic-intelligence', protect, generateCivicIntelligence);

router.post('/ask', protect, askAiCommandCenter);

module.exports = router;
