/**
 * SkillBridge Seed Data Script
 * Equivalent to Django management command: python manage.py seed_data
 *
 * Creates: canonical skills, demo users, demo jobs
 * Run: node src/services/seedData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { SKILL_CATALOG } = require('./resumeParser');

const prisma = new PrismaClient();

// Demo users to create
const DEMO_USERS = [
  {
    username: 'arjun_student',
    email: 'arjun@demo.skillbridge.com',
    password: 'student123',
    role: 'student',
    fullName: 'Arjun Sharma',
    college: 'IIT Delhi',
    degree: 'B.Tech Computer Science',
    graduationYear: 2025,
    location: 'Delhi',
    preferredRole: 'Data Scientist',
    bio: 'Passionate about data science and machine learning.',
    skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Git'],
  },
  {
    username: 'priya_student',
    email: 'priya@demo.skillbridge.com',
    password: 'student123',
    role: 'student',
    fullName: 'Priya Patel',
    college: 'BITS Pilani',
    degree: 'B.Tech Information Technology',
    graduationYear: 2025,
    location: 'Goa',
    preferredRole: 'Full Stack Developer',
    bio: 'Full stack enthusiast who loves building beautiful UIs.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Django'],
  },
  {
    username: 'techcorp_recruiter',
    email: 'techcorp@demo.skillbridge.com',
    password: 'recruiter123',
    role: 'recruiter',
    companyName: 'TechCorp Solutions',
    companyWebsite: 'https://techcorp.example.com',
    companyDescription: 'Enterprise software solutions provider.',
    location: 'Bangalore',
    contactEmail: 'hr@techcorp.example.com',
  },
  {
    username: 'aidynamics_recruiter',
    email: 'aidynamics@demo.skillbridge.com',
    password: 'recruiter123',
    role: 'recruiter',
    companyName: 'AI Dynamics Labs',
    companyWebsite: 'https://aidynamics.example.com',
    companyDescription: 'Cutting-edge AI research and product company.',
    location: 'Hyderabad',
    contactEmail: 'hr@aidynamics.example.com',
  },
  {
    username: 'admin',
    email: 'admin@skillbridge.com',
    password: 'admin123',
    role: 'admin',
    isStaff: true,
  },
];

// Demo jobs (linked to recruiters by username)
const DEMO_JOBS = [
  {
    recruiterUsername: 'techcorp_recruiter',
    title: 'Full Stack Developer Intern',
    companyName: 'TechCorp Solutions',
    description: 'Join our engineering team to build scalable web apps using React and Node.js. You will work on real production features.',
    location: 'Bangalore (Remote-friendly)',
    jobType: 'Internship',
    experienceLevel: 'Intern',
    salaryRange: '₹20,000/month',
    skills: ['React', 'Node.js', 'JavaScript', 'HTML', 'CSS', 'Git'],
  },
  {
    recruiterUsername: 'techcorp_recruiter',
    title: 'DevOps Engineer',
    companyName: 'TechCorp Solutions',
    description: 'Manage cloud infrastructure, CI/CD pipelines, and container orchestration for our SaaS platform.',
    location: 'Bangalore',
    jobType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: '₹8-12 LPA',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Git'],
  },
  {
    recruiterUsername: 'aidynamics_recruiter',
    title: 'Machine Learning Intern',
    companyName: 'AI Dynamics Labs',
    description: 'Work on cutting-edge NLP and computer vision projects. Build and deploy ML models using TensorFlow and PyTorch.',
    location: 'Hyderabad',
    jobType: 'Internship',
    experienceLevel: 'Intern',
    salaryRange: '₹25,000/month',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy'],
  },
  {
    recruiterUsername: 'aidynamics_recruiter',
    title: 'Data Analyst',
    companyName: 'AI Dynamics Labs',
    description: 'Analyze large datasets to generate business insights. Create dashboards using Power BI and Tableau.',
    location: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: '₹6-9 LPA',
    skills: ['Python', 'SQL', 'Data Analysis', 'Power BI', 'Excel'],
  },
  {
    recruiterUsername: 'techcorp_recruiter',
    title: 'Backend Developer',
    companyName: 'TechCorp Solutions',
    description: 'Build robust REST APIs and microservices. Work with PostgreSQL and Node.js in a high-traffic environment.',
    location: 'Bangalore',
    jobType: 'Full-time',
    experienceLevel: 'Entry-level',
    salaryRange: '₹7-11 LPA',
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'SQL', 'Git', 'Docker'],
  },
];

async function main() {
  console.log('🌱 Starting SkillBridge seed...\n');

  // ─── 1. Seed Canonical Skills ────────────────────────────────────────────
  console.log('📚 Seeding skill catalog...');
  let skillCount = 0;
  for (const item of SKILL_CATALOG) {
    await prisma.skill.upsert({
      where: { name: item.name },
      update: { category: item.category },
      create: { name: item.name, category: item.category },
    });
    skillCount++;
  }
  console.log(`   ✅ ${skillCount} skills seeded.\n`);

  // ─── 2. Seed Demo Users ──────────────────────────────────────────────────
  console.log('👥 Seeding demo users...');
  const createdUsers = {};

  for (const userData of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { username: userData.username } });
    if (existing) {
      console.log(`   ⚠️  User '${userData.username}' already exists, skipping.`);
      createdUsers[userData.username] = existing;
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash,
        role: userData.role,
        isStaff: userData.isStaff || false,
        ...(userData.role === 'student' && {
          studentProfile: {
            create: {
              fullName: userData.fullName,
              college: userData.college || '',
              degree: userData.degree || '',
              graduationYear: userData.graduationYear || null,
              location: userData.location || '',
              preferredRole: userData.preferredRole || '',
              bio: userData.bio || '',
            },
          },
        }),
        ...(userData.role === 'recruiter' && {
          recruiterProfile: {
            create: {
              companyName: userData.companyName,
              companyWebsite: userData.companyWebsite || '',
              companyDescription: userData.companyDescription || '',
              location: userData.location || '',
              contactEmail: userData.contactEmail || userData.email,
            },
          },
        }),
      },
    });

    createdUsers[userData.username] = user;
    console.log(`   ✅ Created ${userData.role}: ${userData.username}`);

    // Add demo skills for students
    if (userData.role === 'student' && userData.skills) {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      for (const skillName of userData.skills) {
        const skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (skill && profile) {
          await prisma.studentSkill.upsert({
            where: { studentProfileId_skillId: { studentProfileId: profile.id, skillId: skill.id } },
            update: {},
            create: {
              studentProfileId: profile.id,
              skillId: skill.id,
              isManuallyAdded: true,
            },
          });
        }
      }
      console.log(`      → Added skills: ${userData.skills.join(', ')}`);
    }
  }

  // ─── 3. Seed Demo Jobs ───────────────────────────────────────────────────
  console.log('\n💼 Seeding demo jobs...');
  for (const jobData of DEMO_JOBS) {
    const recruiterUser = createdUsers[jobData.recruiterUsername]
      || await prisma.user.findUnique({ where: { username: jobData.recruiterUsername } });

    if (!recruiterUser) {
      console.log(`   ⚠️  Recruiter '${jobData.recruiterUsername}' not found, skipping job '${jobData.title}'.`);
      continue;
    }

    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: recruiterUser.id } });
    if (!recruiterProfile) {
      console.log(`   ⚠️  Recruiter profile not found for '${jobData.recruiterUsername}', skipping.`);
      continue;
    }

    // Check if job already exists
    const existingJob = await prisma.job.findFirst({
      where: { title: jobData.title, recruiterId: recruiterProfile.id },
    });
    if (existingJob) {
      console.log(`   ⚠️  Job '${jobData.title}' already exists, skipping.`);
      continue;
    }

    const job = await prisma.job.create({
      data: {
        recruiterId: recruiterProfile.id,
        title: jobData.title,
        companyName: jobData.companyName,
        description: jobData.description,
        location: jobData.location,
        jobType: jobData.jobType.replace('-', '_'),
        experienceLevel: (jobData.experienceLevel || 'Entry-level').replace('-', '_'),
        salaryRange: jobData.salaryRange || '',
        isActive: true,
      },
    });

    // Add required skills
    for (const skillName of (jobData.skills || [])) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (skill) {
        await prisma.jobSkill.upsert({
          where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
          update: {},
          create: { jobId: job.id, skillId: skill.id },
        });
      }
    }

    console.log(`   ✅ Created job: ${jobData.title} (${jobData.companyName})`);
  }

  console.log('\n🎉 Seed complete! Demo accounts:');
  console.log('   Student (Data/ML) : arjun_student / student123');
  console.log('   Student (Full Stack): priya_student / student123');
  console.log('   Recruiter (TechCorp): techcorp_recruiter / recruiter123');
  console.log('   Recruiter (AI Labs): aidynamics_recruiter / recruiter123');
  console.log('   Admin              : admin / admin123\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
