const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const { getDashboard, listUsers, toggleJobActive } = require('../controllers/adminController');

router.get('/dashboard', verifyToken, requireAdmin, getDashboard);
router.get('/users', verifyToken, requireAdmin, listUsers);
router.patch('/jobs/:id/toggle-active', verifyToken, requireAdmin, toggleJobActive);

module.exports = router;
