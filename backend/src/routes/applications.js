const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireStudent, requireRecruiter } = require('../middleware/roles');
const { createApplication, getMyApplications, updateStatus } = require('../controllers/applicationController');

// Student endpoints
router.post('/', verifyToken, requireStudent, createApplication);
router.get('/my', verifyToken, requireStudent, getMyApplications);

// Recruiter endpoint (alias for student GET — same path as Django applications/ GET)
// In Django, GET /applications/ and GET /applications/my/ were the same view
router.get('/', verifyToken, requireStudent, getMyApplications);

// Recruiter updates status
router.patch('/:id/status', verifyToken, requireRecruiter, updateStatus);

module.exports = router;
