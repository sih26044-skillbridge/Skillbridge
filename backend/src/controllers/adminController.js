/**
 * Admin Controller — dashboard statistics, user list, job toggle
 * Equivalent to Django AdminDashboardView, AdminUsersListView, AdminToggleJobActiveView
 */

const prisma = require('../config/db');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents, totalRecruiters, totalJobs, activeJobs,
      totalApplications, totalResumes, totalSkills,
      appStatusGroups, recentUsers, recentJobs, recentApplications,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.recruiterProfile.count(),
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.resume.count(),
      prisma.skill.count(),
      prisma.application.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.user.findMany({ orderBy: { dateJoined: 'desc' }, take: 10 }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' }, take: 8,
        include: {
          requiredSkills: { include: { skill: true } },
          recruiter: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.application.findMany({
        orderBy: { appliedAt: 'desc' }, take: 8,
        include: {
          student: { include: { user: true } },
          job: { include: { recruiter: true, _count: { select: { applications: true } } } },
        },
      }),
    ]);

    const statusBreakdown = appStatusGroups.map((g) => ({
      status: g.status?.replace('_', ' ') || g.status,
      count: g._count.id,
    }));

    return res.status(200).json({
      statistics: {
        total_students: totalStudents,
        total_recruiters: totalRecruiters,
        total_jobs: totalJobs,
        active_jobs: activeJobs,
        total_applications: totalApplications,
        total_resumes: totalResumes,
        total_skills: totalSkills,
      },
      application_status_breakdown: statusBreakdown,
      recent_users: recentUsers.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        is_staff: u.isStaff,
        date_joined: u.dateJoined,
      })),
      recent_jobs: recentJobs.map((j) => ({
        id: j.id,
        title: j.title,
        company_name: j.companyName,
        recruiter_company: j.recruiter?.companyName,
        location: j.location,
        job_type: j.jobType?.replace('_', '-'),
        is_active: j.isActive,
        required_skills: (j.requiredSkills || []).map((js) => js.skill?.name),
        applications_count: j._count?.applications ?? 0,
        created_at: j.createdAt,
      })),
      recent_applications: recentApplications.map((a) => ({
        id: a.id,
        status: a.status?.replace('_', ' '),
        applied_at: a.appliedAt,
        student_name: a.student?.fullName,
        job_title: a.job?.title,
        company_name: a.job?.companyName,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      orderBy: { dateJoined: 'desc' },
    });

    return res.status(200).json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        is_staff: u.isStaff,
        is_active: u.isActive,
        date_joined: u.dateJoined,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/jobs/:id/toggle-active
const toggleJobActive = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ detail: 'Job not found.' });

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { isActive: !job.isActive },
    });

    return res.status(200).json({
      message: `Job '${updated.title}' is now ${updated.isActive ? 'active' : 'inactive'}.`,
      is_active: updated.isActive,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, listUsers, toggleJobActive };
