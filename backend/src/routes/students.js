const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');
const upload = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadResume,
  getSkills, addSkill, deleteSkill,
} = require('../controllers/studentController');

router.get('/profile', verifyToken, requireStudent, getProfile);
router.put('/profile', verifyToken, requireStudent, updateProfile);
router.post('/upload-resume', verifyToken, requireStudent, upload.single('file'), uploadResume);
router.get('/skills', verifyToken, requireStudent, getSkills);
router.post('/skills', verifyToken, requireStudent, addSkill);
router.delete('/skills/:skillId', verifyToken, requireStudent, deleteSkill);

module.exports = router;
