const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');
const { getRecommendations } = require('../controllers/recommendationController');

router.get('/', verifyToken, requireStudent, getRecommendations);

module.exports = router;
