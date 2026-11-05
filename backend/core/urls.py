from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    StudentProfileView,
    ResumeUploadView,
    StudentSkillsView,
    StudentSkillDeleteView,
    RecruiterProfileView,
    RecruiterJobsView,
    JobListCreateView,
    JobDetailView,
    JobApplicantsView,
    JobRecommendationsView,
    ApplicationListCreateView,
    ApplicationStatusUpdateView,
    AdminDashboardView,
    AdminUsersListView,
    AdminToggleJobActiveView,
    AvailableSkillsListView,
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),

    # Student Profile & Resume
    path('students/profile/', StudentProfileView.as_view(), name='student-profile'),
    path('students/upload-resume/', ResumeUploadView.as_view(), name='student-upload-resume'),
    path('students/skills/', StudentSkillsView.as_view(), name='student-skills'),
    path('students/skills/<int:skill_id>/', StudentSkillDeleteView.as_view(), name='student-skill-delete'),

    # Recruiter Profile & Listings
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('recruiter/jobs/', RecruiterJobsView.as_view(), name='recruiter-jobs'),

    # Jobs
    path('jobs/', JobListCreateView.as_view(), name='jobs-list-create'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:pk>/applications/', JobApplicantsView.as_view(), name='job-applicants'),

    # Recommendations
    path('recommendations/', JobRecommendationsView.as_view(), name='recommendations'),

    # Applications
    path('applications/', ApplicationListCreateView.as_view(), name='applications-list-create'),
    path('applications/my/', ApplicationListCreateView.as_view(), name='applications-my'),
    path('applications/<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application-status-update'),

    # Admin Management
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', AdminUsersListView.as_view(), name='admin-users'),
    path('admin/jobs/<int:pk>/toggle-active/', AdminToggleJobActiveView.as_view(), name='admin-toggle-job'),

    # Skills catalog
    path('skills/', AvailableSkillsListView.as_view(), name='available-skills'),
]
