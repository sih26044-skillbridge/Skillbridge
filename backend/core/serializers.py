"""
Serializers for SkillBridge REST APIs.
Handles validation, serialization, and deserialization with secure password hashing.
"""

from rest_framework import serializers
from .models import (
    User,
    StudentProfile,
    RecruiterProfile,
    Skill,
    Resume,
    StudentSkill,
    Job,
    JobSkill,
    Application,
    MatchResult,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_id = serializers.IntegerField(source='skill.id', read_only=True)
    name = serializers.CharField(source='skill.name', read_only=True)
    category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = StudentSkill
        fields = ['id', 'skill_id', 'name', 'category', 'is_manually_added', 'created_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    skills = StudentSkillSerializer(source='student_skills', many=True, read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    resumes_count = serializers.IntegerField(source='resumes.count', read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'college',
            'degree',
            'graduation_year',
            'location',
            'preferred_role',
            'bio',
            'skills',
            'resumes_count',
            'created_at',
            'updated_at',
        ]


class RecruiterProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    active_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = RecruiterProfile
        fields = [
            'id',
            'username',
            'email',
            'company_name',
            'company_website',
            'company_description',
            'location',
            'contact_email',
            'contact_phone',
            'active_jobs_count',
            'created_at',
            'updated_at',
        ]

    def get_active_jobs_count(self, obj):
        return obj.jobs.filter(is_active=True).count()


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    recruiter_profile = RecruiterProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_staff', 'student_profile', 'recruiter_profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['student', 'recruiter'])
    
    # Optional profile initializers
    full_name = serializers.CharField(required=False, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    college = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'full_name', 'company_name', 'college', 'location']

    def validate(self, attrs):
        role = attrs.get('role')
        if role == 'student' and not attrs.get('full_name'):
            attrs['full_name'] = attrs.get('username')
        if role == 'recruiter' and not attrs.get('company_name'):
            attrs['company_name'] = f"{attrs.get('username').capitalize()} Hiring"
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role')
        full_name = validated_data.pop('full_name', '')
        company_name = validated_data.pop('company_name', '')
        college = validated_data.pop('college', '')
        location = validated_data.pop('location', '')

        # Create user with properly hashed password
        user = User.objects.create_user(password=password, **validated_data)

        # Create profile based on selected role
        if role == 'student':
            StudentProfile.objects.create(
                user=user,
                full_name=full_name or user.username,
                college=college,
                location=location
            )
        elif role == 'recruiter':
            RecruiterProfile.objects.create(
                user=user,
                company_name=company_name or f"{user.username} Inc",
                location=location,
                contact_email=user.email
            )

        return user


class JobSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = JobSkill
        fields = ['id', 'skill_name', 'category']


class JobSerializer(serializers.ModelSerializer):
    required_skills = serializers.SerializerMethodField()
    skills = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    recruiter_company = serializers.CharField(source='recruiter.company_name', read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company_name',
            'recruiter_company',
            'description',
            'location',
            'job_type',
            'experience_level',
            'salary_range',
            'application_deadline',
            'external_url',
            'is_active',
            'required_skills',
            'skills',
            'applications_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'recruiter_company', 'applications_count']

    def get_required_skills(self, obj):
        return [js.skill.name for js in obj.required_skills.select_related('skill').all()]

    def create(self, validated_data):
        skills_data = validated_data.pop('skills', [])
        job = Job.objects.create(**validated_data)

        for skill_name in skills_data:
            skill_name_clean = skill_name.strip()
            if skill_name_clean:
                skill, _ = Skill.objects.get_or_create(
                    name=skill_name_clean,
                    defaults={'category': 'General'}
                )
                JobSkill.objects.get_or_create(job=job, skill=skill)

        return job

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if skills_data is not None:
            # Refresh skills
            instance.required_skills.all().delete()
            for skill_name in skills_data:
                skill_name_clean = skill_name.strip()
                if skill_name_clean:
                    skill, _ = Skill.objects.get_or_create(
                        name=skill_name_clean,
                        defaults={'category': 'General'}
                    )
                    JobSkill.objects.get_or_create(job=instance, skill=skill)

        return instance


class ApplicationStudentSerializer(serializers.ModelSerializer):
    """Snapshot of applicant student info for recruiters."""
    skills = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    latest_resume = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'full_name',
            'email',
            'college',
            'degree',
            'graduation_year',
            'location',
            'preferred_role',
            'skills',
            'latest_resume',
        ]

    def get_skills(self, obj):
        return list(obj.student_skills.values_list('skill__name', flat=True))

    def get_latest_resume(self, obj):
        latest = obj.resumes.first()
        if latest and latest.file:
            return {
                'id': latest.id,
                'file_name': latest.file_name,
                'file_url': latest.file.url if latest.file else None,
                'uploaded_at': latest.uploaded_at
            }
        return None


class ApplicationSerializer(serializers.ModelSerializer):
    student_details = ApplicationStudentSerializer(source='student', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(is_active=True),
        source='job',
        write_only=True
    )
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'job_id',
            'job_details',
            'student_details',
            'status',
            'cover_letter',
            'applied_at',
            'updated_at',
            'match_score',
        ]
        read_only_fields = ['id', 'status', 'applied_at', 'updated_at', 'match_score']

    def get_match_score(self, obj):
        # Retrieve cached match result if available
        mr = MatchResult.objects.filter(student=obj.student, job=obj.job).first()
        return mr.match_score if mr else None


class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'file', 'file_name', 'file_url', 'uploaded_at']
        read_only_fields = ['id', 'file_name', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None
