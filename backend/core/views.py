"""
SkillBridge API Views.
Implements authentication, student profiles, resume parsing, job management,
matching recommendations, applications, and admin metrics.
"""

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404

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
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    StudentProfileSerializer,
    RecruiterProfileSerializer,
    JobSerializer,
    ApplicationSerializer,
    SkillSerializer,
    StudentSkillSerializer,
)
from .permissions import IsStudent, IsRecruiter, IsAdminUserRole
from .resume_parser import extract_text_from_pdf, extract_skills
from .matcher import compute_and_save_recommendations, calculate_match


# ==========================================
# AUTHENTICATION VIEWS
# ==========================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Registration successful.',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': user_data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'detail': 'Please provide both username and password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Support login by username or email
        user = authenticate(username=username, password=password)
        if not user:
            # Check if username passed is an email
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            return Response(
                {'detail': 'Invalid credentials. Please verify your username/email and password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'This account has been disabled.'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Login successful.',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': user_data
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # DRF SimpleJWT token invalidation (client removes token from local storage)
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


# ==========================================
# STUDENT PROFILE & RESUME VIEWS
# ==========================================

class StudentProfileView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username}
        )
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username}
        )
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResumeUploadView(APIView):
    """
    Handles PDF resume upload, extracts text using PyMuPDF, extracts normalized skills,
    associates skills with the student, and triggers match score recalculation.
    """
    permission_classes = [IsStudent]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No resume file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES['file']
        if not uploaded_file.name.lower().endswith('.pdf'):
            return Response({'detail': 'Only PDF files are supported for resume parsing.'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username}
        )

        # 1. Extract text from uploaded PDF
        extracted_text = extract_text_from_pdf(uploaded_file)

        # Reset pointer for saving file to disk
        uploaded_file.seek(0)

        # 2. Save Resume model instance
        resume = Resume.objects.create(
            student=profile,
            file=uploaded_file,
            file_name=uploaded_file.name,
            raw_text=extracted_text
        )

        # 3. Identify and normalize skills
        identified_skills = extract_skills(extracted_text)

        # 4. Save extracted skills
        new_skills_added = []
        for skill_name in identified_skills:
            skill_obj, _ = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'category': 'General'}
            )
            student_skill, created = StudentSkill.objects.get_or_create(
                student=profile,
                skill=skill_obj,
                defaults={'resume': resume, 'is_manually_added': False}
            )
            if created or student_skill.resume is None:
                student_skill.resume = resume
                student_skill.save()
            new_skills_added.append(skill_name)

        # 5. Recompute recommendations immediately
        compute_and_save_recommendations(profile)

        # 6. Retrieve all student skills
        all_student_skills = list(
            profile.student_skills.values_list('skill__name', flat=True)
        )

        return Response({
            'message': f'Resume parsed successfully. Extracted {len(identified_skills)} skills.',
            'resume_id': resume.id,
            'file_name': resume.file_name,
            'extracted_skills': identified_skills,
            'all_skills': all_student_skills,
            'extracted_text_preview': extracted_text[:300] + ('...' if len(extracted_text) > 300 else '')
        }, status=status.HTTP_201_CREATED)


class StudentSkillsView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        skills = profile.student_skills.select_related('skill').all()
        serializer = StudentSkillSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        skill_name = request.data.get('name', '').strip()
        if not skill_name:
            return Response({'detail': 'Skill name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        skill_obj, _ = Skill.objects.get_or_create(
            name=skill_name,
            defaults={'category': request.data.get('category', 'General')}
        )

        student_skill, created = StudentSkill.objects.get_or_create(
            student=profile,
            skill=skill_obj,
            defaults={'is_manually_added': True}
        )

        # Recompute matches
        compute_and_save_recommendations(profile)

        serializer = StudentSkillSerializer(student_skill)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class StudentSkillDeleteView(APIView):
    permission_classes = [IsStudent]

    def delete(self, request, skill_id):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        student_skill = get_object_or_404(StudentSkill, student=profile, skill_id=skill_id)
        student_skill.delete()
        # Recompute matches
        compute_and_save_recommendations(profile)
        return Response({'message': 'Skill removed successfully.'}, status=status.HTTP_200_OK)


# ==========================================
# JOB LISTINGS & RECRUITER VIEWS
# ==========================================

class JobListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRecruiter()]
        return [AllowAny()]

    def get(self, request):
        # Filter active jobs
        queryset = Job.objects.filter(is_active=True).prefetch_related('required_skills__skill', 'recruiter')

        # Search parameter (title or company or description)
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company_name__icontains=search) |
                Q(description__icontains=search)
            )

        # Location filter
        location = request.query_params.get('location', '').strip()
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Job type filter
        job_type = request.query_params.get('job_type', '').strip()
        if job_type:
            queryset = queryset.filter(job_type=job_type)

        # Experience level filter
        exp_level = request.query_params.get('experience_level', '').strip()
        if exp_level:
            queryset = queryset.filter(experience_level=exp_level)

        # Skill filter
        skill_name = request.query_params.get('skill', '').strip()
        if skill_name:
            queryset = queryset.filter(required_skills__skill__name__iexact=skill_name)

        serializer = JobSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(
            user=request.user,
            defaults={'company_name': f"{request.user.username} Organization"}
        )

        data = request.data.copy()
        if not data.get('company_name'):
            data['company_name'] = profile.company_name

        serializer = JobSerializer(data=data)
        if serializer.is_valid():
            job = serializer.save(recruiter=profile)
            return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsRecruiter()]
        return [AllowAny()]

    def get(self, request, pk):
        job = get_object_or_404(Job.objects.prefetch_related('required_skills__skill'), pk=pk)
        serializer = JobSerializer(job)
        data = serializer.data

        # If user is student, compute match metrics for this specific job
        if request.user.is_authenticated and request.user.role == 'student':
            profile = getattr(request.user, 'student_profile', None)
            if profile:
                student_skills = list(profile.student_skills.values_list('skill__name', flat=True))
                req_skills = data.get('required_skills', [])
                match_info = calculate_match(student_skills, req_skills)
                data['match_analysis'] = match_info

                # Check if already applied
                applied = Application.objects.filter(student=profile, job=job).first()
                data['has_applied'] = applied is not None
                data['application_status'] = applied.status if applied else None

        return Response(data)

    def put(self, request, pk):
        job = get_object_or_404(Job, pk=pk, recruiter__user=request.user)
        serializer = JobSerializer(job, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        job = get_object_or_404(Job, pk=pk, recruiter__user=request.user)
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk, recruiter__user=request.user)
        job.delete()
        return Response({'message': 'Job posting deleted successfully.'}, status=status.HTTP_200_OK)


class RecruiterJobsView(APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        jobs = Job.objects.filter(recruiter=profile).prefetch_related('required_skills__skill', 'applications')
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class RecruiterProfileView(APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(
            user=request.user,
            defaults={'company_name': f"{request.user.username} Organization"}
        )
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# RECOMMENDATION ENGINE VIEW
# ==========================================

class JobRecommendationsView(APIView):
    """
    Skill-based job recommendations for the authenticated student.
    Formula: Match Score = (Number of matched required skills / Total required skills) * 100
    Ranked descending by match score.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username}
        )

        # Compute live recommendations
        raw_recs = compute_and_save_recommendations(profile)

        # Format output
        results = []
        applied_job_ids = set(
            Application.objects.filter(student=profile).values_list('job_id', flat=True)
        )

        for item in raw_recs:
            job_obj = item['job']
            job_data = JobSerializer(job_obj).data
            job_data['has_applied'] = job_obj.id in applied_job_ids
            
            results.append({
                'job': job_data,
                'match_score': item['match_score'],
                'matched_skills': item['matched_skills'],
                'missing_skills': item['missing_skills'],
                'total_required': item['total_required'],
            })

        return Response({
            'total_recommendations': len(results),
            'student_skills_count': profile.student_skills.count(),
            'recommendations': results
        })


# ==========================================
# APPLICATION SYSTEM VIEWS
# ==========================================

class ApplicationListCreateView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        """Get all applications submitted by the logged-in student."""
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        apps = Application.objects.filter(student=profile).select_related('job', 'job__recruiter')
        serializer = ApplicationSerializer(apps, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Submit a job application."""
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username}
        )
        job_id = request.data.get('job_id')
        cover_letter = request.data.get('cover_letter', '')

        if not job_id:
            return Response({'detail': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, pk=job_id, is_active=True)

        # Prevent duplicate applications
        if Application.objects.filter(student=profile, job=job).exists():
            return Response(
                {'detail': 'You have already submitted an application for this job.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        app = Application.objects.create(
            student=profile,
            job=job,
            status='Applied',
            cover_letter=cover_letter
        )

        return Response(ApplicationSerializer(app).data, status=status.HTTP_201_CREATED)


class JobApplicantsView(APIView):
    """Recruiter view to inspect all applicants for one of their jobs."""
    permission_classes = [IsRecruiter]

    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk, recruiter__user=request.user)
        apps = Application.objects.filter(job=job).select_related('student', 'student__user')
        serializer = ApplicationSerializer(apps, many=True)
        return Response({
            'job': JobSerializer(job).data,
            'total_applicants': apps.count(),
            'applicants': serializer.data
        })


class ApplicationStatusUpdateView(APIView):
    """Recruiter updates applicant status (Applied, Under Review, Shortlisted, Rejected, Selected)."""
    permission_classes = [IsRecruiter]

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk, job__recruiter__user=request.user)
        new_status = request.data.get('status')

        valid_statuses = [choice[0] for choice in Application.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'detail': f"Invalid status '{new_status}'. Allowed choices: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = new_status
        application.save()

        return Response(ApplicationSerializer(application).data)


# ==========================================
# ADMIN DASHBOARD & MANAGEMENT VIEWS
# ==========================================

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_students = StudentProfile.objects.count()
        total_recruiters = RecruiterProfile.objects.count()
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(is_active=True).count()
        total_applications = Application.objects.count()
        total_resumes = Resume.objects.count()
        total_skills = Skill.objects.count()

        # Status breakdown of applications
        app_status_breakdown = list(
            Application.objects.values('status').annotate(count=Count('id'))
        )

        recent_users = User.objects.order_by('-date_joined')[:10]
        recent_jobs = Job.objects.order_by('-created_at')[:8]
        recent_applications = Application.objects.select_related('student', 'job').order_by('-applied_at')[:8]

        return Response({
            'statistics': {
                'total_students': total_students,
                'total_recruiters': total_recruiters,
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'total_applications': total_applications,
                'total_resumes': total_resumes,
                'total_skills': total_skills,
            },
            'application_status_breakdown': app_status_breakdown,
            'recent_users': UserSerializer(recent_users, many=True).data,
            'recent_jobs': JobSerializer(recent_jobs, many=True).data,
            'recent_applications': ApplicationSerializer(recent_applications, many=True).data,
        })


class AdminUsersListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        role_filter = request.query_params.get('role')
        if role_filter:
            users = users.filter(role=role_filter)
        return Response(UserSerializer(users, many=True).data)


class AdminToggleJobActiveView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        job.is_active = not job.is_active
        job.save()
        return Response({
            'message': f"Job '{job.title}' is now {'active' if job.is_active else 'inactive'}.",
            'is_active': job.is_active
        })


# ==========================================
# PUBLIC CATALOG VIEWS
# ==========================================

class AvailableSkillsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        skills = Skill.objects.all().order_by('name')
        return Response(SkillSerializer(skills, many=True).data)
