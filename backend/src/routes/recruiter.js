const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRecruiter } = require('../middleware/roles');
const { getProfile, updateProfile, getRecruiterJobs } = require('../controllers/recruiterController');

router.get('/profile', verifyToken, requireRecruiter, getProfile);
router.put('/profile', verifyToken, requireRecruiter, updateProfile);
router.get('/jobs', verifyToken, requireRecruiter, getRecruiterJobs);

module.exports = router;
