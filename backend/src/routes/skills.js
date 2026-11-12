const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// GET /api/skills — public catalog of all skills
router.get('/', async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json(
      skills.map((s) => ({ id: s.id, name: s.name, category: s.category }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
