from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import StudentProfile, RecruiterProfile, Skill, Job, JobSkill, StudentSkill, Application
from core.resume_parser import extract_skills
from core.matcher import calculate_match

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_student_user(self):
        user = User.objects.create_user(
            username='test_student',
            email='test@student.edu',
            password='Password123',
            role='student'
        )
        self.assertTrue(user.is_student)
        self.assertFalse(user.is_recruiter)
        self.assertFalse(user.is_admin_user)
        self.assertTrue(user.check_password('Password123'))

    def test_create_recruiter_user(self):
        user = User.objects.create_user(
            username='test_recruiter',
            email='test@recruiter.com',
            password='Password123',
            role='recruiter'
        )
        self.assertTrue(user.is_recruiter)
        self.assertFalse(user.is_student)


class SkillExtractionTests(TestCase):
    def test_extract_skills_with_aliases(self):
        sample_text = (
            "Experience in Python, React, and JS. Built neural networks with ML and NLP. "
            "Familiar with PostgreSQL, Docker, and Git."
        )
        skills = extract_skills(sample_text)
        self.assertIn("Python", skills)
        self.assertIn("React", skills)
        self.assertIn("JavaScript", skills)  # normalized from JS
        self.assertIn("Machine Learning", skills)  # normalized from ML
        self.assertIn("Natural Language Processing", skills)  # normalized from NLP
        self.assertIn("PostgreSQL", skills)
        self.assertIn("Docker", skills)
        self.assertIn("Git", skills)

    def test_no_false_positive_partial_words(self):
        # 'Java' should not match inside 'JavaScript' when java is absent
        sample_text = "Proficient only in JavaScript and Digital marketing."
        skills = extract_skills(sample_text)
        self.assertIn("JavaScript", skills)
        self.assertNotIn("Java", skills)
        self.assertNotIn("Git", skills)  # 'Digital' should not trigger Git


class MatchAlgorithmTests(TestCase):
    def test_sih_example_match_calculation(self):
        """
        Verify the exact prompt specification:
        Student skills: Python, SQL, Pandas
        Job requirements: Python, SQL, Machine Learning, Power BI
        Result: 50% match, Matched: Python, SQL, Missing: Machine Learning, Power BI
        """
        student_skills = ["Python", "SQL", "Pandas"]
        job_skills = ["Python", "SQL", "Machine Learning", "Power BI"]

        result = calculate_match(student_skills, job_skills)

        self.assertEqual(result['match_score'], 50.0)
        self.assertEqual(result['matched_skills'], ["Python", "SQL"])
        self.assertEqual(result['missing_skills'], ["Machine Learning", "Power BI"])
        self.assertEqual(result['total_required'], 4)

    def test_empty_job_skills_safe_division(self):
        result = calculate_match(["Python"], [])
        self.assertEqual(result['match_score'], 0.0)
        self.assertEqual(result['total_required'], 0)


class IntegrationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create student
        self.student_user = User.objects.create_user(
            username='sam_student',
            email='sam@college.edu',
            password='secretpassword',
            role='student'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            full_name='Sam Student'
        )

        # Create recruiter & job
        self.recruiter_user = User.objects.create_user(
            username='recruiter_rob',
            email='rob@company.com',
            password='secretpassword',
            role='recruiter'
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company_name='Rob Dynamics'
        )

        self.skill_python = Skill.objects.create(name='Python')
        self.skill_django = Skill.objects.create(name='Django')

        self.job = Job.objects.create(
            recruiter=self.recruiter_profile,
            title='Backend Django Developer',
            company_name='Rob Dynamics',
            description='Build APIs',
            location='Bengaluru',
            job_type='Internship',
            is_active=True
        )
        JobSkill.objects.create(job=self.job, skill=self.skill_python)
        JobSkill.objects.create(job=self.job, skill=self.skill_django)

    def test_login_and_recommendations(self):
        # 1. Login
        login_res = self.client.post('/api/auth/login/', {
            'username': 'sam_student',
            'password': 'secretpassword'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        token = login_res.data['tokens']['access']

        # 2. Add skill
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        add_skill_res = self.client.post('/api/students/skills/', {'name': 'Python'}, format='json')
        self.assertEqual(add_skill_res.status_code, status.HTTP_201_CREATED)

        # 3. Check recommendations
        rec_res = self.client.get('/api/recommendations/')
        self.assertEqual(rec_res.status_code, status.HTTP_200_OK)
        recs = rec_res.data['recommendations']
        self.assertTrue(len(recs) > 0)
        self.assertEqual(recs[0]['match_score'], 50.0)
        self.assertIn('Python', recs[0]['matched_skills'])
        self.assertIn('Django', recs[0]['missing_skills'])

    def test_apply_and_prevent_duplicate(self):
        self.client.force_authenticate(user=self.student_user)

        # First apply
        apply_res = self.client.post('/api/applications/', {
            'job_id': self.job.id,
            'cover_letter': 'Very excited for this internship!'
        }, format='json')
        self.assertEqual(apply_res.status_code, status.HTTP_201_CREATED)

        # Duplicate apply attempt
        dup_res = self.client.post('/api/applications/', {
            'job_id': self.job.id
        }, format='json')
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)
