/**
 * Job Controller — list, create, detail, update, delete, applicant list
 * Equivalent to Django JobListCreateView, JobDetailView, JobApplicantsView
 */

const prisma = require('../config/db');
const { calculateMatch } = require('../services/matcher');

/** Format Job for API responses (matches Django JobSerializer) */
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
    applications_count: job._count?.applications ?? job.applications?.length ?? 0,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

/** Format Application for recruiter applicant view */
function formatApplication(app) {
  const student = app.student;
  return {
    id: app.id,
    status: app.status?.replace('_', ' ') || app.status,
    cover_letter: app.coverLetter,
    applied_at: app.appliedAt,
    updated_at: app.updatedAt,
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
    match_score: app.matchScore ?? null,
  };
}

const jobInclude = {
  requiredSkills: { include: { skill: true }, orderBy: { skill: { name: 'asc' } } },
  recruiter: true,
  _count: { select: { applications: true } },
};

// GET /api/jobs
const listJobs = async (req, res, next) => {
  try {
    const { search, location, job_type, experience_level, skill } = req.query;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (job_type) {
      // Map "Full-time" → "Full_time" for Prisma enum
      where.jobType = job_type.replace('-', '_');
    }
    if (experience_level) {
      where.experienceLevel = experience_level.replace('-', '_');
    }
    if (skill) {
      where.requiredSkills = {
        some: { skill: { name: { equals: skill, mode: 'insensitive' } } },
      };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(jobs.map(formatJob));
  } catch (err) {
    next(err);
  }
};

// POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    let profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.recruiterProfile.create({
        data: {
          userId: req.user.id,
          companyName: `${req.user.username} Organization`,
        },
      });
    }

    const {
      title, company_name, description, location, job_type,
      experience_level, salary_range, application_deadline,
      external_url, is_active, skills,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ detail: 'title, description, and location are required.' });
    }

    const job = await prisma.job.create({
      data: {
        recruiterId: profile.id,
        title,
        companyName: company_name || profile.companyName,
        description,
        location,
        jobType: (job_type || 'Internship').replace('-', '_'),
        experienceLevel: (experience_level || 'Entry-level').replace('-', '_'),
        salaryRange: salary_range || '',
        applicationDeadline: application_deadline ? new Date(application_deadline) : null,
        externalUrl: external_url || '',
        isActive: is_active !== undefined ? is_active : true,
        ...(skills && skills.length > 0 && {
          requiredSkills: {
            create: await Promise.all(
              skills.filter(Boolean).map(async (skillName) => {
                const skill = await prisma.skill.upsert({
                  where: { name: skillName.trim() },
                  update: {},
                  create: { name: skillName.trim(), category: 'General' },
                });
                return { skillId: skill.id };
              })
            ),
          },
        }),
      },
      include: jobInclude,
    });

    return res.status(201).json(formatJob(job));
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/:id
const getJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: jobInclude,
    });

    if (!job) {
      return res.status(404).json({ detail: 'Job not found.' });
    }

    const data = formatJob(job);

    // If authenticated student, compute match analysis
    if (req.user && req.user.role === 'student') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (profile) {
        const studentSkills = await prisma.studentSkill.findMany({
          where: { studentProfileId: profile.id },
          include: { skill: true },
        });
        const studentSkillNames = studentSkills.map((ss) => ss.skill.name);
        const reqSkills = data.required_skills;
        data.match_analysis = calculateMatch(studentSkillNames, reqSkills);

        const applied = await prisma.application.findUnique({
          where: { studentProfileId_jobId: { studentProfileId: profile.id, jobId } },
        });
        data.has_applied = !!applied;
        data.application_status = applied ? applied.status?.replace('_', ' ') : null;
      }
    }

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// PUT /api/jobs/:id  (full update)
const updateJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ detail: 'Recruiter profile not found.' });

    const job = await prisma.job.findFirst({ where: { id: jobId, recruiterId: profile.id } });
    if (!job) return res.status(404).json({ detail: 'Job not found or not owned by you.' });

    const {
      title, company_name, description, location, job_type,
      experience_level, salary_range, application_deadline,
      external_url, is_active, skills,
    } = req.body;

    // If skills provided, replace them
    if (skills !== undefined) {
      await prisma.jobSkill.deleteMany({ where: { jobId } });
      for (const skillName of (skills || []).filter(Boolean)) {
        const skill = await prisma.skill.upsert({
          where: { name: skillName.trim() },
          update: {},
          create: { name: skillName.trim(), category: 'General' },
        });
        await prisma.jobSkill.upsert({
          where: { jobId_skillId: { jobId, skillId: skill.id } },
          update: {},
          create: { jobId, skillId: skill.id },
        });
      }
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(title !== undefined && { title }),
        ...(company_name !== undefined && { companyName: company_name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(job_type !== undefined && { jobType: job_type.replace('-', '_') }),
        ...(experience_level !== undefined && { experienceLevel: experience_level.replace('-', '_') }),
        ...(salary_range !== undefined && { salaryRange: salary_range }),
        ...(application_deadline !== undefined && { applicationDeadline: application_deadline ? new Date(application_deadline) : null }),
        ...(external_url !== undefined && { externalUrl: external_url }),
        ...(is_active !== undefined && { isActive: is_active }),
      },
      include: jobInclude,
    });

    return res.status(200).json(formatJob(updated));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ detail: 'Recruiter profile not found.' });

    const job = await prisma.job.findFirst({ where: { id: jobId, recruiterId: profile.id } });
    if (!job) return res.status(404).json({ detail: 'Job not found or not owned by you.' });

    await prisma.job.delete({ where: { id: jobId } });
    return res.status(200).json({ message: 'Job posting deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/:id/applications  (recruiter only)
const getJobApplicants = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ detail: 'Recruiter profile not found.' });

    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId: profile.id },
      include: jobInclude,
    });
    if (!job) return res.status(404).json({ detail: 'Job not found or not owned by you.' });

    const apps = await prisma.application.findMany({
      where: { jobId },
      include: {
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

    // Attach match scores from cache
    const appsWithScores = await Promise.all(
      apps.map(async (app) => {
        const mr = await prisma.matchResult.findUnique({
          where: { studentProfileId_jobId: { studentProfileId: app.studentProfileId, jobId } },
        });
        return { ...app, matchScore: mr?.matchScore ?? null };
      })
    );

    return res.status(200).json({
      job: formatJob(job),
      total_applicants: apps.length,
      applicants: appsWithScores.map(formatApplication),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listJobs, createJob, getJob, updateJob, deleteJob, getJobApplicants };
