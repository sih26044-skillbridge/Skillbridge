/**
 * SkillBridge — Node.js/Express API Entry Point
 * Equivalent to Django's config/urls.py + wsgi.py
 *
 * API base: http://localhost:8000/api/
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const jobRoutes = require('./routes/jobs');
const recruiterRoutes = require('./routes/recruiter');
const recommendationRoutes = require('./routes/recommendations');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const skillRoutes = require('./routes/skills');

const app = express();
const PORT = process.env.PORT || 8000;

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed.`));
      }
    },
    credentials: true,
  })
);

// ─── BODY PARSERS ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── STATIC FILES (uploaded resumes) ────────────────────────────────────────
app.use('/media/resumes', express.static(path.join(__dirname, '../uploads')));

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'SkillBridge API is running.', timestamp: new Date().toISOString() })
);

// ─── API ROUTES ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ detail: `Route '${req.method} ${req.path}' not found.` });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SkillBridge API running at http://localhost:${PORT}/api/`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
