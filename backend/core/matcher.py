"""
Recommendation and Skill Matching Engine for SkillBridge (SIH26044).
Formula: Match Score = (Number of matched required skills / Total required skills) * 100
"""

from .models import Job, MatchResult, StudentSkill


def calculate_match(student_skill_names, job_required_skill_names):
    """
    Computes deterministic match metrics between a student's skills and a job's requirements.
    
    Formula:
        Match Score = (Matched Skills / Total Required Skills) * 100
    """
    # Normalize to lowercase sets for matching, while retaining display casing
    student_lookup = {name.lower(): name for name in student_skill_names}
    job_lookup = {name.lower(): name for name in job_required_skill_names}

    if not job_lookup:
        # If a job specifies 0 required skills, return neutral/zero score
        return {
            'match_score': 0.0,
            'matched_skills': [],
            'missing_skills': [],
            'total_required': 0
        }

    matched = []
    missing = []

    for lower_req, original_req in job_lookup.items():
        if lower_req in student_lookup:
            matched.append(original_req)
        else:
            missing.append(original_req)

    total_required = len(job_lookup)
    score = (len(matched) / total_required) * 100.0

    return {
        'match_score': round(score, 1),
        'matched_skills': sorted(matched),
        'missing_skills': sorted(missing),
        'total_required': total_required
    }


def compute_and_save_recommendations(student_profile):
    """
    Evaluates all active jobs against the student's skills,
    updates or creates MatchResult records, and returns ranked recommendations.
    """
    # 1. Fetch student's skill names
    student_skills = list(
        StudentSkill.objects.filter(student=student_profile)
        .values_list('skill__name', flat=True)
    )

    # 2. Fetch active jobs with prefetched required skills
    active_jobs = Job.objects.filter(is_active=True).prefetch_related('required_skills__skill')

    recommendations = []

    for job in active_jobs:
        job_skills = [
            js.skill.name for js in job.required_skills.all()
        ]
        
        match_data = calculate_match(student_skills, job_skills)

        # 3. Update or create cached MatchResult
        match_result, _ = MatchResult.objects.update_or_create(
            student=student_profile,
            job=job,
            defaults={
                'match_score': match_data['match_score'],
                'matched_skills': match_data['matched_skills'],
                'missing_skills': match_data['missing_skills'],
            }
        )

        recommendations.append({
            'job': job,
            'match_score': match_data['match_score'],
            'matched_skills': match_data['matched_skills'],
            'missing_skills': match_data['missing_skills'],
            'total_required': match_data['total_required'],
        })

    # 4. Rank descending by match score, then creation date
    recommendations.sort(key=lambda x: (x['match_score'], x['job'].created_at), reverse=True)
    return recommendations
