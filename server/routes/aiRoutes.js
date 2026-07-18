const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { generateComplaintData, investigate, finalizeComplaint } = require('../controllers/aiController');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

router.post('/generate', protect, upload.single('image'), generateComplaintData);
router.post('/investigate', protect, upload.single('image'), investigate);
router.post('/finalize-complaint', protect, upload.none(), finalizeComplaint);

module.exports = router;
