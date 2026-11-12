/**
 * Recommendation Controller — skill-based job recommendations for authenticated student
 * Equivalent to Django JobRecommendationsView
 */

const prisma = require('../config/db');
const { computeAndSaveRecommendations } = require('../services/matcher');

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

// GET /api/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: { _count: { select: { studentSkills: true } } },
    });

    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: req.user.id, fullName: req.user.username },
        include: { _count: { select: { studentSkills: true } } },
      });
    }

    // Compute live recommendations
    const rawRecs = await computeAndSaveRecommendations(profile.id);

    // Get student's applied job IDs
    const applications = await prisma.application.findMany({
      where: { studentProfileId: profile.id },
      select: { jobId: true },
    });
    const appliedJobIds = new Set(applications.map((a) => a.jobId));

    const results = rawRecs.map((item) => {
      const jobData = formatJob(item.job);
      jobData.has_applied = appliedJobIds.has(item.job.id);
      return {
        job: jobData,
        match_score: item.match_score,
        matched_skills: item.matched_skills,
        missing_skills: item.missing_skills,
        total_required: item.total_required,
      };
    });

    return res.status(200).json({
      total_recommendations: results.length,
      student_skills_count: profile._count?.studentSkills ?? 0,
      recommendations: results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
