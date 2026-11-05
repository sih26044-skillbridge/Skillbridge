from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
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


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Role', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Role', {'fields': ('role', 'email')}),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'college', 'degree', 'graduation_year', 'preferred_role')
    search_fields = ('full_name', 'user__username', 'user__email', 'college', 'degree')
    list_filter = ('graduation_year',)


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user', 'location', 'contact_email')
    search_fields = ('company_name', 'user__username', 'user__email', 'location')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    search_fields = ('name', 'category')
    list_filter = ('category',)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('student', 'file_name', 'uploaded_at')
    search_fields = ('student__full_name', 'file_name')
    readonly_fields = ('uploaded_at',)


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'is_manually_added', 'created_at')
    list_filter = ('is_manually_added', 'skill')
    search_fields = ('student__full_name', 'skill__name')


class JobSkillInline(admin.TabularInline):
    model = JobSkill
    extra = 1


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'job_type', 'experience_level', 'location', 'is_active', 'created_at')
    list_filter = ('job_type', 'experience_level', 'is_active')
    search_fields = ('title', 'company_name', 'location', 'description')
    inlines = [JobSkillInline]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'job', 'status', 'applied_at', 'updated_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('student__full_name', 'job__title', 'job__company_name')


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'job', 'match_score', 'calculated_at')
    list_filter = ('calculated_at',)
    search_fields = ('student__full_name', 'job__title')
