/**
 * Recruiter Controller — profile management, own job listings
 * Equivalent to Django RecruiterProfileView, RecruiterJobsView
 */

const prisma = require('../config/db');

function formatProfile(p) {
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
    active_jobs_count: p.jobs?.filter((j) => j.isActive).length ?? p._count?.jobs ?? 0,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

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

// GET /api/recruiter/profile
const getProfile = async (req, res, next) => {
  try {
    let profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: true,
        jobs: { where: { isActive: true }, select: { id: true } },
      },
    });

    if (!profile) {
      profile = await prisma.recruiterProfile.create({
        data: {
          userId: req.user.id,
          companyName: `${req.user.username} Organization`,
        },
        include: {
          user: true,
          jobs: { where: { isActive: true }, select: { id: true } },
        },
      });
    }

    return res.status(200).json(formatProfile(profile));
  } catch (err) {
    next(err);
  }
};

// PUT /api/recruiter/profile
const updateProfile = async (req, res, next) => {
  try {
    let profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.recruiterProfile.create({
        data: { userId: req.user.id, companyName: `${req.user.username} Organization` },
      });
    }

    const { company_name, company_website, company_description, location, contact_email, contact_phone } = req.body;

    const updated = await prisma.recruiterProfile.update({
      where: { id: profile.id },
      data: {
        ...(company_name !== undefined && { companyName: company_name }),
        ...(company_website !== undefined && { companyWebsite: company_website }),
        ...(company_description !== undefined && { companyDescription: company_description }),
        ...(location !== undefined && { location }),
        ...(contact_email !== undefined && { contactEmail: contact_email }),
        ...(contact_phone !== undefined && { contactPhone: contact_phone }),
      },
      include: {
        user: true,
        jobs: { where: { isActive: true }, select: { id: true } },
      },
    });

    return res.status(200).json(formatProfile(updated));
  } catch (err) {
    next(err);
  }
};

// GET /api/recruiter/jobs
const getRecruiterJobs = async (req, res, next) => {
  try {
    let profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(200).json([]);
    }

    const jobs = await prisma.job.findMany({
      where: { recruiterId: profile.id },
      include: {
        requiredSkills: { include: { skill: true }, orderBy: { skill: { name: 'asc' } } },
        recruiter: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(jobs.map(formatJob));
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getRecruiterJobs };
