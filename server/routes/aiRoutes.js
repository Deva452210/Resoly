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
  generateExecutiveSummary
} = require('../controllers/aiController');
const { upload } = require('../config/cloudinary');

router.post('/generate', protect, upload.single('image'), generateComplaintData);
router.post('/investigate', protect, upload.single('image'), investigate);
router.post('/finalize-complaint', protect, upload.none(), finalizeComplaint);
router.post('/audit-resolution', protect, upload.single('afterImage'), auditResolution);

router.get('/executive-summary', protect, getLatestExecutiveSummary);
router.post('/executive-summary', protect, generateExecutiveSummary);

module.exports = router;
