/**
 * Auth Controller — register, login, logout, current user
 * Equivalent to Django RegisterView, LoginView, LogoutView, CurrentUserView
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/** Generate JWT access + refresh tokens */
function generateTokens(userId) {
  const access = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '7d',
  });
  const refresh = jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
  });
  return { access, refresh };
}

/** Format user object for API responses (matches Django UserSerializer) */
async function formatUser(user) {
  const studentProfile = user.role === 'student'
    ? await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: {
          studentSkills: { include: { skill: true } },
          resumes: { select: { id: true } },
        },
      })
    : null;

  const recruiterProfile = user.role === 'recruiter'
    ? await prisma.recruiterProfile.findUnique({
        where: { userId: user.id },
        include: { jobs: { where: { isActive: true }, select: { id: true } } },
      })
    : null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    is_staff: user.isStaff,
    student_profile: studentProfile ? formatStudentProfile(studentProfile) : null,
    recruiter_profile: recruiterProfile ? formatRecruiterProfile(recruiterProfile) : null,
  };
}

function formatStudentProfile(p) {
  if (!p) return null;
  return {
    id: p.id,
    username: p.user?.username,
    email: p.user?.email,
    full_name: p.fullName,
    college: p.college,
    degree: p.degree,
    graduation_year: p.graduationYear,
    location: p.location,
    preferred_role: p.preferredRole,
    bio: p.bio,
    skills: (p.studentSkills || []).map((ss) => ({
      id: ss.id,
      skill_id: ss.skill.id,
      name: ss.skill.name,
      category: ss.skill.category,
      is_manually_added: ss.isManuallyAdded,
      created_at: ss.createdAt,
    })),
    resumes_count: p.resumes?.length || 0,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function formatRecruiterProfile(p) {
  if (!p) return null;
  return {
    id: p.id,
    username: p.user?.username,
    email: p.user?.email,
    company_name: p.companyName,
    company_website: p.companyWebsite,
    company_description: p.companyDescription,
    location: p.location,
    contact_email: p.contactEmail,
    contact_phone: p.contactPhone,
    active_jobs_count: p.jobs?.length || 0,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, role, full_name, company_name, college, location } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ detail: 'username, email, password, and role are required.' });
    }
    if (!['student', 'recruiter'].includes(role)) {
      return res.status(400).json({ detail: 'Role must be "student" or "recruiter".' });
    }
    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters.' });
    }

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      const field = existing.username === username ? 'username' : 'email';
      return res.status(400).json({ detail: `A user with this ${field} already exists.` });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        ...(role === 'student' && {
          studentProfile: {
            create: {
              fullName: full_name || username,
              college: college || '',
              location: location || '',
            },
          },
        }),
        ...(role === 'recruiter' && {
          recruiterProfile: {
            create: {
              companyName: company_name || `${username} Inc`,
              location: location || '',
              contactEmail: email,
            },
          },
        }),
      },
    });

    const { access, refresh } = generateTokens(user.id);
    const userData = await formatUser(user);

    return res.status(201).json({
      message: 'Registration successful.',
      tokens: { refresh, access },
      user: userData,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ detail: 'Please provide both username and password.' });
    }

    // Support login by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim() },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials. Please verify your username/email and password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ detail: 'Invalid credentials. Please verify your username/email and password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ detail: 'This account has been disabled.' });
    }

    const { access, refresh } = generateTokens(user.id);
    const userData = await formatUser(user);

    return res.status(200).json({
      message: 'Login successful.',
      tokens: { refresh, access },
      user: userData,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // JWT is stateless — client removes token from storage
  return res.status(200).json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const userData = await formatUser(req.user);
    return res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me, formatStudentProfile, formatRecruiterProfile };
