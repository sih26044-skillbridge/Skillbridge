/**
 * Role-based access control middleware.
 * All role checks require `verifyToken` to run first.
 */

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ detail: 'Access restricted to students only.' });
  }
  next();
};

const requireRecruiter = (req, res, next) => {
  if (!req.user || req.user.role !== 'recruiter') {
    return res.status(403).json({ detail: 'Access restricted to recruiters only.' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && !req.user.isStaff)) {
    return res.status(403).json({ detail: 'Access restricted to administrators only.' });
  }
  next();
};

module.exports = { requireStudent, requireRecruiter, requireAdmin };
