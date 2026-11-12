/**
 * Student Controller — profile, resume upload, skills management
 * Equivalent to Django StudentProfileView, ResumeUploadView, StudentSkillsView, StudentSkillDeleteView
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const { extractTextFromPdf, extractSkills } = require('../services/resumeParser');
const { computeAndSaveRecommendations } = require('../services/matcher');

/** Format a StudentProfile for API response */
function formatProfile(profile) {
  return {
    id: profile.id,
    username: profile.user?.username,
    email: profile.user?.email,
    full_name: profile.fullName,
    college: profile.college,
    degree: profile.degree,
    graduation_year: profile.graduationYear,
    location: profile.location,
    preferred_role: profile.preferredRole,
    bio: profile.bio,
    skills: (profile.studentSkills || []).map((ss) => ({
      id: ss.id,
      skill_id: ss.skill.id,
      name: ss.skill.name,
      category: ss.skill.category,
      is_manually_added: ss.isManuallyAdded,
      created_at: ss.createdAt,
    })),
    resumes_count: profile._count?.resumes ?? profile.resumes?.length ?? 0,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

/** Ensure student profile exists (get or create) */
async function getOrCreateProfile(user) {
  let profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
      studentSkills: { include: { skill: true }, orderBy: { skill: { name: 'asc' } } },
      _count: { select: { resumes: true } },
    },
  });

  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: { userId: user.id, fullName: user.username },
      include: {
        user: true,
        studentSkills: { include: { skill: true } },
        _count: { select: { resumes: true } },
      },
    });
  }
  return profile;
}

// GET /api/students/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user);
    return res.status(200).json(formatProfile(profile));
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/profile
const updateProfile = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: req.user.id, fullName: req.user.username },
      });
    }

    const { full_name, college, degree, graduation_year, location, preferred_role, bio } = req.body;

    const updated = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        ...(full_name !== undefined && { fullName: full_name }),
        ...(college !== undefined && { college }),
        ...(degree !== undefined && { degree }),
        ...(graduation_year !== undefined && { graduationYear: graduation_year ? parseInt(graduation_year) : null }),
        ...(location !== undefined && { location }),
        ...(preferred_role !== undefined && { preferredRole: preferred_role }),
        ...(bio !== undefined && { bio }),
      },
      include: {
        user: true,
        studentSkills: { include: { skill: true }, orderBy: { skill: { name: 'asc' } } },
        _count: { select: { resumes: true } },
      },
    });

    return res.status(200).json(formatProfile(updated));
  } catch (err) {
    next(err);
  }
};

// POST /api/students/upload-resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No resume file provided.' });
    }

    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: req.user.id, fullName: req.user.username },
      });
    }

    // 1. Read uploaded file from disk and extract text
    const fileBuffer = fs.readFileSync(req.file.path);
    const extractedText = await extractTextFromPdf(fileBuffer);

    // 2. Save Resume record
    const resume = await prisma.resume.create({
      data: {
        studentProfileId: profile.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        rawText: extractedText,
      },
    });

    // 3. Extract and normalize skills
    const identifiedSkills = extractSkills(extractedText);

    // 4. Save extracted skills (upsert to avoid duplicates)
    const newSkillsAdded = [];
    for (const skillName of identifiedSkills) {
      const skillObj = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName, category: 'General' },
      });

      const existing = await prisma.studentSkill.findUnique({
        where: {
          studentProfileId_skillId: {
            studentProfileId: profile.id,
            skillId: skillObj.id,
          },
        },
      });

      if (!existing) {
        await prisma.studentSkill.create({
          data: {
            studentProfileId: profile.id,
            skillId: skillObj.id,
            resumeId: resume.id,
            isManuallyAdded: false,
          },
        });
        newSkillsAdded.push(skillName);
      } else if (!existing.resumeId) {
        await prisma.studentSkill.update({
          where: { id: existing.id },
          data: { resumeId: resume.id },
        });
      }
    }

    // 5. Recompute recommendations
    await computeAndSaveRecommendations(profile.id);

    // 6. Retrieve all student skill names
    const allStudentSkills = await prisma.studentSkill.findMany({
      where: { studentProfileId: profile.id },
      include: { skill: true },
    });
    const allSkillNames = allStudentSkills.map((ss) => ss.skill.name);

    return res.status(201).json({
      message: `Resume parsed successfully. Extracted ${identifiedSkills.length} skills.`,
      resume_id: resume.id,
      file_name: resume.fileName,
      extracted_skills: identifiedSkills,
      all_skills: allSkillNames,
      extracted_text_preview:
        extractedText.slice(0, 300) + (extractedText.length > 300 ? '...' : ''),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/skills
const getSkills = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: req.user.id, fullName: req.user.username },
      });
    }

    const skills = await prisma.studentSkill.findMany({
      where: { studentProfileId: profile.id },
      include: { skill: true },
      orderBy: { skill: { name: 'asc' } },
    });

    return res.status(200).json(
      skills.map((ss) => ({
        id: ss.id,
        skill_id: ss.skill.id,
        name: ss.skill.name,
        category: ss.skill.category,
        is_manually_added: ss.isManuallyAdded,
        created_at: ss.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/students/skills
const addSkill = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: { userId: req.user.id, fullName: req.user.username },
      });
    }

    const skillName = (req.body.name || '').trim();
    if (!skillName) {
      return res.status(400).json({ detail: 'Skill name is required.' });
    }

    const skillObj = await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName, category: req.body.category || 'General' },
    });

    const existing = await prisma.studentSkill.findUnique({
      where: {
        studentProfileId_skillId: {
          studentProfileId: profile.id,
          skillId: skillObj.id,
        },
      },
      include: { skill: true },
    });

    if (existing) {
      // Recompute matches even if already existed
      await computeAndSaveRecommendations(profile.id);
      return res.status(200).json({
        id: existing.id,
        skill_id: existing.skill.id,
        name: existing.skill.name,
        category: existing.skill.category,
        is_manually_added: existing.isManuallyAdded,
        created_at: existing.createdAt,
      });
    }

    const studentSkill = await prisma.studentSkill.create({
      data: {
        studentProfileId: profile.id,
        skillId: skillObj.id,
        isManuallyAdded: true,
      },
      include: { skill: true },
    });

    await computeAndSaveRecommendations(profile.id);

    return res.status(201).json({
      id: studentSkill.id,
      skill_id: studentSkill.skill.id,
      name: studentSkill.skill.name,
      category: studentSkill.skill.category,
      is_manually_added: studentSkill.isManuallyAdded,
      created_at: studentSkill.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/skills/:skillId
const deleteSkill = async (req, res, next) => {
  try {
    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ detail: 'Student profile not found.' });
    }

    const skillId = parseInt(req.params.skillId);
    const studentSkill = await prisma.studentSkill.findFirst({
      where: { studentProfileId: profile.id, skillId },
    });

    if (!studentSkill) {
      return res.status(404).json({ detail: 'Skill not found in your profile.' });
    }

    await prisma.studentSkill.delete({ where: { id: studentSkill.id } });
    await computeAndSaveRecommendations(profile.id);

    return res.status(200).json({ message: 'Skill removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadResume, getSkills, addSkill, deleteSkill };
