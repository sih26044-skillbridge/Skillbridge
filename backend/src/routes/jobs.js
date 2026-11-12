const express = require('express');
const router = express.Router();
const { verifyToken, optionalToken } = require('../middleware/auth');
const { requireRecruiter } = require('../middleware/roles');
const {
  listJobs, createJob, getJob, updateJob, deleteJob, getJobApplicants,
} = require('../controllers/jobController');

// Public list — optional token for match analysis
router.get('/', optionalToken, listJobs);

// Protected create — recruiter only
router.post('/', verifyToken, requireRecruiter, createJob);

// Job detail — optional token for student match analysis
router.get('/:id', optionalToken, getJob);

// Update/delete — recruiter only (must own the job)
router.put('/:id', verifyToken, requireRecruiter, updateJob);
router.patch('/:id', verifyToken, requireRecruiter, updateJob);
router.delete('/:id', verifyToken, requireRecruiter, deleteJob);

// Applicants — recruiter only
router.get('/:id/applications', verifyToken, requireRecruiter, getJobApplicants);

module.exports = router;
