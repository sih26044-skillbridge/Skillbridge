from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model with role-based access control for SkillBridge:
    - student: Access to profile, resume upload, jobs, recommendations, applications.
    - recruiter: Access to company profile, post/manage jobs, view applicants.
    - admin: Platform administration and statistics.
    """
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('recruiter', 'Recruiter'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    email = models.EmailField(unique=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_recruiter(self):
        return self.role == 'recruiter'

    @property
    def is_admin_user(self):
        return self.role == 'admin' or self.is_superuser or self.is_staff


class StudentProfile(models.Model):
    """
    Detailed profile for students containing academic background and career preferences.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=150)
    college = models.CharField(max_length=255, blank=True)
    degree = models.CharField(max_length=150, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=150, blank=True)
    preferred_role = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.username} - Student"


class RecruiterProfile(models.Model):
    """
    Detailed profile for recruiters representing hiring organizations.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(blank=True)
    company_description = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"


class Skill(models.Model):
    """
    Master table of canonical skills (e.g., Python, React, Machine Learning).
    """
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True, default='General')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Resume(models.Model):
    """
    Uploaded PDF resume for a student and its extracted raw text content.
    """
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    file_name = models.CharField(max_length=255, blank=True)
    raw_text = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Resume for {self.student.full_name} ({self.uploaded_at.strftime('%Y-%m-%d %H:%M')})"


class StudentSkill(models.Model):
    """
    Skills associated with a student, either extracted from resume or added manually.
    """
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='student_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='extracted_skills')
    is_manually_added = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'skill')
        ordering = ['skill__name']

    def __str__(self):
        return f"{self.student.full_name} - {self.skill.name}"


class Job(models.Model):
    """
    Job and Internship postings created by recruiters.
    """
    JOB_TYPE_CHOICES = (
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Internship', 'Internship'),
        ('Remote', 'Remote'),
        ('Contract', 'Contract'),
    )

    EXPERIENCE_LEVEL_CHOICES = (
        ('Intern', 'Intern'),
        ('Entry-level', 'Entry-level'),
        ('Mid-level', 'Mid-level'),
        ('Senior-level', 'Senior-level'),
    )

    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=150)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES, default='Internship')
    experience_level = models.CharField(max_length=50, choices=EXPERIENCE_LEVEL_CHOICES, default='Entry-level')
    salary_range = models.CharField(max_length=100, blank=True, help_text="e.g. ₹20,000/month or ₹6-8 LPA")
    application_deadline = models.DateField(null=True, blank=True)
    external_url = models.URLField(blank=True, help_text="Optional external career page or application link")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company_name}"


class JobSkill(models.Model):
    """
    Skills required or preferred for a specific job listing.
    """
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='required_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='job_skills')

    class Meta:
        unique_together = ('job', 'skill')
        ordering = ['skill__name']

    def __str__(self):
        return f"{self.job.title} - {self.skill.name}"


class Application(models.Model):
    """
    Application submitted by a student for a specific job/internship.
    """
    STATUS_CHOICES = (
        ('Applied', 'Applied'),
        ('Under Review', 'Under Review'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
        ('Selected', 'Selected'),
    )

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Applied')
    cover_letter = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'job')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.full_name} -> {self.job.title} ({self.status})"


class MatchResult(models.Model):
    """
    Cached or computed skill match result between a student and a job.
    Formula: (Matched Skills / Total Required Skills) * 100
    """
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='match_results')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='match_results')
    match_score = models.FloatField(default=0.0)
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'job')
        ordering = ['-match_score', '-calculated_at']

    def __str__(self):
        return f"{self.student.full_name} vs {self.job.title}: {self.match_score:.1f}%"
