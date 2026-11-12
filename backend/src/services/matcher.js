/**
 * Recommendation and Skill Matching Engine for SkillBridge.
 * Ported directly from the original Python matcher.py.
 *
 * Formula: Match Score = (Matched Skills / Total Required Skills) * 100
 */

const prisma = require('../config/db');

/**
 * Computes deterministic match metrics between a student's skills and a job's requirements.
 *
 * @param {string[]} studentSkillNames  - Array of canonical skill names the student has
 * @param {string[]} jobRequiredSkillNames - Array of canonical skill names the job requires
 * @returns {{ match_score: number, matched_skills: string[], missing_skills: string[], total_required: number }}
 */
function calculateMatch(studentSkillNames, jobRequiredSkillNames) {
  // Normalize to lowercase maps for matching, while retaining display casing
  const studentLookup = {};
  for (const name of studentSkillNames) {
    studentLookup[name.toLowerCase()] = name;
  }

  const jobLookup = {};
  for (const name of jobRequiredSkillNames) {
    jobLookup[name.toLowerCase()] = name;
  }

  if (Object.keys(jobLookup).length === 0) {
    // If a job specifies 0 required skills, return neutral/zero score
    return {
      match_score: 0.0,
      matched_skills: [],
      missing_skills: [],
      total_required: 0,
    };
  }

  const matched = [];
  const missing = [];

  for (const [lowerReq, originalReq] of Object.entries(jobLookup)) {
    if (lowerReq in studentLookup) {
      matched.push(originalReq);
    } else {
      missing.push(originalReq);
    }
  }

  const totalRequired = Object.keys(jobLookup).length;
  const score = (matched.length / totalRequired) * 100.0;

  return {
    match_score: Math.round(score * 10) / 10,
    matched_skills: matched.sort(),
    missing_skills: missing.sort(),
    total_required: totalRequired,
  };
}

/**
 * Evaluates all active jobs against a student's skills,
 * updates or creates MatchResult records, and returns ranked recommendations.
 *
 * @param {number} studentProfileId
 * @returns {Promise<Array>} ranked recommendation objects
 */
async function computeAndSaveRecommendations(studentProfileId) {
  // 1. Fetch student's skill names
  const studentSkillRows = await prisma.studentSkill.findMany({
    where: { studentProfileId },
    include: { skill: true },
  });
  const studentSkillNames = studentSkillRows.map((ss) => ss.skill.name);

  // 2. Fetch active jobs with required skills
  const activeJobs = await prisma.job.findMany({
    where: { isActive: true },
    include: {
      requiredSkills: { include: { skill: true } },
      recruiter: true,
    },
  });

  const recommendations = [];

  for (const job of activeJobs) {
    const jobSkillNames = job.requiredSkills.map((js) => js.skill.name);
    const matchData = calculateMatch(studentSkillNames, jobSkillNames);

    // 3. Upsert MatchResult cache
    await prisma.matchResult.upsert({
      where: {
        studentProfileId_jobId: {
          studentProfileId,
          jobId: job.id,
        },
      },
      update: {
        matchScore: matchData.match_score,
        matchedSkills: matchData.matched_skills,
        missingSkills: matchData.missing_skills,
      },
      create: {
        studentProfileId,
        jobId: job.id,
        matchScore: matchData.match_score,
        matchedSkills: matchData.matched_skills,
        missingSkills: matchData.missing_skills,
      },
    });

    recommendations.push({
      job,
      match_score: matchData.match_score,
      matched_skills: matchData.matched_skills,
      missing_skills: matchData.missing_skills,
      total_required: matchData.total_required,
    });
  }

  // 4. Rank descending by match score, then by createdAt desc
  recommendations.sort((a, b) => {
    if (b.match_score !== a.match_score) return b.match_score - a.match_score;
    return new Date(b.job.createdAt) - new Date(a.job.createdAt);
  });

  return recommendations;
}

module.exports = { calculateMatch, computeAndSaveRecommendations };
