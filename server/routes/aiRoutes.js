const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { generateComplaintData } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Using protect middleware to ensure only authenticated users can access AI route
router.post('/generate', protect, upload.single('image'), generateComplaintData);

module.exports = router;
