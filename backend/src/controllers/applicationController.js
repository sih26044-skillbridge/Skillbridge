/**
 * Application Controller — submit, list own, update status
 * Equivalent to Django ApplicationListCreateView, ApplicationStatusUpdateView
 */

const prisma = require('../config/db');

const VALID_STATUSES = ['Applied', 'Under_Review', 'Shortlisted', 'Rejected', 'Selected'];
const STATUS_DISPLAY = {
  Applied: 'Applied',
  Under_Review: 'Under Review',
  Shortlisted: 'Shortlisted',
  Rejected: 'Rejected',
  Selected: 'Selected',
};

function formatJob(job) {
  return {
    id: job.id,
    title: job.title,
    company_name: job.companyName,
    recruiter_company: job.recruiter?.companyName || null,
    description: job.description,
    location: job.location,
    job_type: job.jobType?.replace('_', '-') || job.jobType,
    experience_level: job.experienceLevel?.replace('_', '-') || job.experienceLevel,
    salary_range: job.salaryRange,
    application_deadline: job.applicationDeadline,
    external_url: job.externalUrl,
    is_active: job.isActive,
    required_skills: (job.requiredSkills || []).map((js) => js.skill?.name || js),
    applications_count: job._count?.applications ?? 0,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function formatApplication(app, matchScore = null) {
  const student = app.student;
  return {
    id: app.id,
    job_id: app.jobId,
    job_details: app.job ? formatJob(app.job) : null,
    student_details: student
      ? {
          id: student.id,
          full_name: student.fullName,
          email: student.user?.email,
          college: student.college,
          degree: student.degree,
          graduation_year: student.graduationYear,
          location: student.location,
          preferred_role: student.preferredRole,
          skills: (student.studentSkills || []).map((ss) => ss.skill?.name),
          latest_resume: student.resumes?.[0]
            ? {
                id: student.resumes[0].id,
                file_name: student.resumes[0].fileName,
                uploaded_at: student.resumes[0].uploadedAt,
              }
            : null,
        }
      : null,
    status: STATUS_DISPLAY[app.status] || app.status,
    cover_letter: app.coverLetter,
    applied_at: app.appliedAt,
    updated_at: app.updatedAt,
    match_score: matchScore,
  };
}

// POST /api/applications — student submits application
const createApplication = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: req.user.id, fullName: req.user.username },
      });
    }

    const { job_id, cover_letter } = req.body;
    if (!job_id) {
      return res.status(400).json({ detail: 'job_id is required.' });
    }

    const job = await prisma.job.findFirst({ where: { id: parseInt(job_id), isActive: true } });
    if (!job) {
      return res.status(404).json({ detail: 'Active job not found.' });
    }

    // Prevent duplicate applications
    const existing = await prisma.application.findUnique({
      where: { studentProfileId_jobId: { studentProfileId: profile.id, jobId: job.id } },
    });
    if (existing) {
      return res.status(400).json({ detail: 'You have already submitted an application for this job.' });
    }

    const app = await prisma.application.create({
      data: {
        studentProfileId: profile.id,
        jobId: job.id,
        status: 'Applied',
        coverLetter: cover_letter || '',
      },
      include: {
        job: {
          include: {
            requiredSkills: { include: { skill: true } },
            recruiter: true,
            _count: { select: { applications: true } },
          },
        },
        student: {
          include: {
            user: true,
            studentSkills: { include: { skill: true } },
            resumes: { orderBy: { uploadedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    return res.status(201).json(formatApplication(app));
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/my — student views own applications
const getMyApplications = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(200).json([]);
    }

    const apps = await prisma.application.findMany({
      where: { studentProfileId: profile.id },
      include: {
        job: {
          include: {
            requiredSkills: { include: { skill: true } },
            recruiter: true,
            _count: { select: { applications: true } },
          },
        },
        student: {
          include: {
            user: true,
            studentSkills: { include: { skill: true } },
            resumes: { orderBy: { uploadedAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Attach cached match scores
    const formatted = await Promise.all(
      apps.map(async (app) => {
        const mr = await prisma.matchResult.findUnique({
          where: { studentProfileId_jobId: { studentProfileId: profile.id, jobId: app.jobId } },
        });
        return formatApplication(app, mr?.matchScore ?? null);
      })
    );

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id/status — recruiter updates applicant status
const updateStatus = async (req, res, next) => {
  try {
    const appId = parseInt(req.params.id);
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ detail: 'Recruiter profile not found.' });

    const application = await prisma.application.findFirst({
      where: { id: appId, job: { recruiterId: profile.id } },
      include: {
        job: {
          include: {
            requiredSkills: { include: { skill: true } },
            recruiter: true,
            _count: { select: { applications: true } },
          },
        },
        student: {
          include: {
            user: true,
            studentSkills: { include: { skill: true } },
            resumes: { orderBy: { uploadedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ detail: 'Application not found or not associated with your jobs.' });
    }

    // Map "Under Review" → "Under_Review" for Prisma enum
    const newStatus = (req.body.status || '').replace(' ', '_');
    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        detail: `Invalid status '${req.body.status}'. Allowed: Applied, Under Review, Shortlisted, Rejected, Selected`,
      });
    }

    const updated = await prisma.application.update({
      where: { id: appId },
      data: { status: newStatus },
      include: {
        job: {
          include: {
            requiredSkills: { include: { skill: true } },
            recruiter: true,
            _count: { select: { applications: true } },
          },
        },
        student: {
          include: {
            user: true,
            studentSkills: { include: { skill: true } },
            resumes: { orderBy: { uploadedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    return res.status(200).json(formatApplication(updated));
  } catch (err) {
    next(err);
  }
};

module.exports = { createApplication, getMyApplications, updateStatus };
