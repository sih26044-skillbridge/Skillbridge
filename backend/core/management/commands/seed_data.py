"""
Seed initial demo data for SkillBridge SIH demonstration.
Populates standard skill taxonomy, demo recruiter & student accounts, and active job postings.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import StudentProfile, RecruiterProfile, Skill, Job, JobSkill, StudentSkill, Application
from core.resume_parser import SKILL_CATALOG
from core.matcher import compute_and_save_recommendations

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds initial skills, demo users, job postings, and applications.'

    def handle(self, *args, **options):
        self.stdout.write("Populating Skill Catalog...")
        skill_objs = {}
        for item in SKILL_CATALOG:
            skill, _ = Skill.objects.get_or_create(
                name=item['name'],
                defaults={'category': item.get('category', 'General')}
            )
            skill_objs[item['name']] = skill

        self.stdout.write(f"Seeded {len(skill_objs)} canonical skills.")

        # 1. Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@skillbridge.edu',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write("Created Admin: admin / admin123")

        # 2. Recruiter 1: Tech Innovators
        rec1_user, created = User.objects.get_or_create(
            username='techcorp_recruiter',
            defaults={
                'email': 'hiring@techcorp.io',
                'role': 'recruiter',
            }
        )
        if created:
            rec1_user.set_password('recruiter123')
            rec1_user.save()
        
        rec1_profile, _ = RecruiterProfile.objects.get_or_create(
            user=rec1_user,
            defaults={
                'company_name': 'TechCorp Solutions',
                'company_website': 'https://techcorp.example.com',
                'company_description': 'Leading enterprise software & cloud transformation company.',
                'location': 'Bengaluru, India',
                'contact_email': 'careers@techcorp.io',
                'contact_phone': '+91 9876543210'
            }
        )

        # Recruiter 2: AI Dynamics
        rec2_user, created = User.objects.get_or_create(
            username='aidynamics_recruiter',
            defaults={
                'email': 'talent@aidynamics.ai',
                'role': 'recruiter',
            }
        )
        if created:
            rec2_user.set_password('recruiter123')
            rec2_user.save()
        
        rec2_profile, _ = RecruiterProfile.objects.get_or_create(
            user=rec2_user,
            defaults={
                'company_name': 'AI Dynamics Labs',
                'company_website': 'https://aidynamics.example.ai',
                'company_description': 'Next-generation AI research and machine learning product startup.',
                'location': 'Hyderabad, India',
                'contact_email': 'careers@aidynamics.ai',
                'contact_phone': '+91 9812345678'
            }
        )

        # 3. Student 1: Arjun Sharma (Data/Python specialist)
        stud1_user, created = User.objects.get_or_create(
            username='arjun_student',
            defaults={
                'email': 'arjun.sharma@college.edu',
                'role': 'student',
            }
        )
        if created:
            stud1_user.set_password('student123')
            stud1_user.save()

        stud1_profile, _ = StudentProfile.objects.get_or_create(
            user=stud1_user,
            defaults={
                'full_name': 'Arjun Sharma',
                'college': 'National Institute of Technology',
                'degree': 'B.Tech in Computer Science',
                'graduation_year': 2026,
                'location': 'Bengaluru, India',
                'preferred_role': 'Data Scientist / ML Engineer',
                'bio': 'Passionate about machine learning, statistical modeling, and data pipelines.'
            }
        )

        # Add skills for Arjun: Python, SQL, Pandas, NumPy
        arjun_skills = ['Python', 'SQL', 'Pandas', 'NumPy', 'Git']
        for s_name in arjun_skills:
            if s_name in skill_objs:
                StudentSkill.objects.get_or_create(
                    student=stud1_profile,
                    skill=skill_objs[s_name],
                    defaults={'is_manually_added': False}
                )

        # Student 2: Priya Patel (Full-stack developer)
        stud2_user, created = User.objects.get_or_create(
            username='priya_student',
            defaults={
                'email': 'priya.patel@engineering.edu',
                'role': 'student',
            }
        )
        if created:
            stud2_user.set_password('student123')
            stud2_user.save()

        stud2_profile, _ = StudentProfile.objects.get_or_create(
            user=stud2_user,
            defaults={
                'full_name': 'Priya Patel',
                'college': 'Delhi Technological University',
                'degree': 'B.Tech in Information Technology',
                'graduation_year': 2025,
                'location': 'Delhi, India',
                'preferred_role': 'Full Stack Developer',
                'bio': 'Full-stack developer building scalable web applications with React, Django, and Node.js.'
            }
        )

        # Add skills for Priya: React, JavaScript, HTML, CSS, Django, Python
        priya_skills = ['React', 'JavaScript', 'HTML', 'CSS', 'Django', 'Python', 'Git']
        for s_name in priya_skills:
            if s_name in skill_objs:
                StudentSkill.objects.get_or_create(
                    student=stud2_profile,
                    skill=skill_objs[s_name],
                    defaults={'is_manually_added': True}
                )

        # 4. Jobs
        # Job 1: Full Stack Web Developer Intern
        job1, _ = Job.objects.get_or_create(
            recruiter=rec1_profile,
            title='Full Stack Web Developer Intern',
            defaults={
                'company_name': rec1_profile.company_name,
                'description': 'We are looking for an energetic Full Stack Developer Intern to work with our engineering team on building modern web services using React, Django, and RESTful APIs.',
                'location': 'Bengaluru, India (Hybrid)',
                'job_type': 'Internship',
                'experience_level': 'Entry-level',
                'salary_range': '₹25,000 / month',
                'is_active': True,
            }
        )
        for s in ['Python', 'Django', 'React', 'JavaScript', 'SQL']:
            if s in skill_objs:
                JobSkill.objects.get_or_create(job=job1, skill=skill_objs[s])

        # Job 2: Data Science & ML Intern (Perfect match example from Problem Statement)
        job2, _ = Job.objects.get_or_create(
            recruiter=rec2_profile,
            title='Data Science & Analytics Intern',
            defaults={
                'company_name': rec2_profile.company_name,
                'description': 'Join our AI team to uncover insights from large datasets, build predictive models, and create interactive dashboards for decision makers.',
                'location': 'Hyderabad, India (Remote)',
                'job_type': 'Internship',
                'experience_level': 'Intern',
                'salary_range': '₹30,000 / month',
                'is_active': True,
            }
        )
        # Python, SQL, Machine Learning, Power BI (as mentioned in prompt example!)
        for s in ['Python', 'SQL', 'Machine Learning', 'Power BI']:
            if s in skill_objs:
                JobSkill.objects.get_or_create(job=job2, skill=skill_objs[s])

        # Job 3: Cloud & DevOps Associate
        job3, _ = Job.objects.get_or_create(
            recruiter=rec1_profile,
            title='Cloud & DevOps Associate',
            defaults={
                'company_name': rec1_profile.company_name,
                'description': 'Work with AWS cloud infrastructure, containerize services using Docker, and assist with CI/CD deployment automation pipelines.',
                'location': 'Pune, India',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'salary_range': '₹6.5 - 8.5 LPA',
                'is_active': True,
            }
        )
        for s in ['AWS', 'Docker', 'Linux', 'Git', 'Python']:
            if s in skill_objs:
                JobSkill.objects.get_or_create(job=job3, skill=skill_objs[s])

        # Job 4: Frontend Engineer (React/TypeScript)
        job4, _ = Job.objects.get_or_create(
            recruiter=rec2_profile,
            title='Frontend Engineer (React)',
            defaults={
                'company_name': rec2_profile.company_name,
                'description': 'Create intuitive, responsive, and high-performance UI components using modern React, Tailwind CSS, and TypeScript.',
                'location': 'Remote',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'salary_range': '₹7.0 - 9.0 LPA',
                'is_active': True,
            }
        )
        for s in ['React', 'JavaScript', 'HTML', 'CSS', 'Git']:
            if s in skill_objs:
                JobSkill.objects.get_or_create(job=job4, skill=skill_objs[s])

        # 5. Compute recommendations for both demo students
        compute_and_save_recommendations(stud1_profile)
        compute_and_save_recommendations(stud2_profile)

        # 6. Sample Application
        Application.objects.get_or_create(
            student=stud1_profile,
            job=job2,
            defaults={
                'status': 'Under Review',
                'cover_letter': 'I have hands-on experience with Python data science stacks (Pandas, NumPy, SQL) and am eager to contribute to AI Dynamics.'
            }
        )
        Application.objects.get_or_create(
            student=stud2_profile,
            job=job1,
            defaults={
                'status': 'Shortlisted',
                'cover_letter': 'I built several full-stack apps with React & Django and would love to join TechCorp as an intern.'
            }
        )

        self.stdout.write(self.style.SUCCESS("SkillBridge demo database successfully seeded!"))
