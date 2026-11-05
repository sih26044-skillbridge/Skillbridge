"""
Role-based permission classes for SkillBridge.
Ensures strict role segregation:
- Students cannot access recruiter/admin operations
- Recruiters cannot access student resume upload / admin operations
- Admin can access administrative metrics and management
"""

from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Allows access only to authenticated users with the 'student' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')


class IsRecruiter(permissions.BasePermission):
    """Allows access only to authenticated users with the 'recruiter' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'recruiter')


class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to authenticated users with 'admin' role or Django staff/superuser."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )
