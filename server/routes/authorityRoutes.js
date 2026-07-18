const express = require('express');
const router = express.Router();
const { protect, authority } = require('../middleware/authMiddleware');
const {
  getAuthorityComplaints,
  getAuthorityComplaintById,
} = require('../controllers/authorityController');

// All routes here are protected and require the authority role
router.use(protect, authority);

router.get('/complaints', getAuthorityComplaints);
router.get('/complaints/:id', getAuthorityComplaintById);

module.exports = router;
