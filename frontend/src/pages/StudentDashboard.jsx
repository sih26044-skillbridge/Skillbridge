import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/student.service';
import { recommendationService } from '../services/recommendation.service';
import { applicationService } from '../services/application.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import {
  FileText,
  Sparkles,
  Send,
  Briefcase,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [profileData, recData, appData] = await Promise.all([
          studentService.getProfile(),
          recommendationService.getRecommendations(),
          applicationService.getMyApplications(),
        ]);
        setProfile(profileData);
        setRecommendations(recData.recommendations || []);
        setApplications(appData || []);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your student placement dashboard..." size="lg" />;
  }

  const studentSkills = profile?.skills || [];
  const topRecommendations = recommendations.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const getStatusBadge = (status) => {
    const styles = {
      Applied: 'bg-blue-50 text-blue-700 border-blue-200',
      'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
      Shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            AI-Assisted Placement Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {profile?.full_name || user?.username}! 👋
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            {profile?.college ? `${profile.college} • ` : ''}
            {profile?.preferred_role || 'Targeting Software & Engineering Roles'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/student/resume-upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-105"
          >
            <FileText className="w-4 h-4" />
            Upload PDF Resume
          </Link>
          <Link
            to="/student/recommendations"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            View Matches ({recommendations.length})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Verified Skills</p>
            <p className="text-2xl font-extrabold text-slate-900">{studentSkills.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Job Matches</p>
            <p className="text-2xl font-extrabold text-slate-900">{recommendations.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Applications Sent</p>
            <p className="text-2xl font-extrabold text-slate-900">{applications.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Resumes Parsed</p>
            <p className="text-2xl font-extrabold text-slate-900">{profile?.resumes_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Top Matches + Extracted Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Top Skill-Matched Opportunities
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by deterministic match score = (matched skills / required) × 100
              </p>
            </div>
            <Link
              to="/student/recommendations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              See all ({recommendations.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topRecommendations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No job matches available yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your resume or add your skills to start receiving calibrated recommendations.
              </p>
              <Link
                to="/student/resume-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Upload Resume Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {topRecommendations.map((item) => {
                const job = item.job;
                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 transition-all shadow-xs hover:shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                          {job.job_type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" /> {job.company_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <MatchScoreBadge score={item.match_score} showBar={false} />
                      </div>
                    </div>

                    {/* Matched vs Missing Pills */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      {item.matched_skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-emerald-700 font-semibold mr-1">Matched:</span>
                          {item.matched_skills.map((s) => (
                            <SkillBadge key={s} name={s} variant="matched" size="sm" />
                          ))}
                        </div>
                      )}
                      {item.missing_skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-rose-700 font-semibold mr-1">Missing Skills:</span>
                          {item.missing_skills.map((s) => (
                            <SkillBadge key={s} name={s} variant="missing" size="sm" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {job.salary_range || 'Competitive stipend'}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Inspect & Apply <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Your Extracted Skills & Recent Applications */}
        <div className="space-y-6">
          {/* Skills Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your Skills Portfolio</h3>
                <p className="text-xs text-slate-500">{studentSkills.length} identified proficiencies</p>
              </div>
              <Link
                to="/student/profile"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {studentSkills.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-500">No skills identified yet.</p>
                <Link
                  to="/student/resume-upload"
                  className="inline-block text-xs font-semibold text-blue-600 underline"
                >
                  Upload your resume now
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {studentSkills.map((sk) => (
                  <SkillBadge key={sk.id} name={sk.name} variant="default" size="sm" />
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <Link
                to="/student/resume-upload"
                className="text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Parse new PDF
              </Link>
              <Link
                to="/student/profile"
                className="text-slate-600 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add manual skill
              </Link>
            </div>
          </div>

          {/* Recent Applications Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Application Pipeline</h3>
              <Link
                to="/student/applications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all ({applications.length})
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                You haven't submitted any job applications yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">
                        {app.job_details?.title}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{app.job_details?.company_name}</span>
                      <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
