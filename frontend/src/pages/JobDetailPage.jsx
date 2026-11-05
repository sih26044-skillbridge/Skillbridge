import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/job.service';
import { applicationService } from '../services/application.service';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import {
  Building,
  MapPin,
  Briefcase,
  Calendar,
  Sparkles,
  Send,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  Check,
} from 'lucide-react';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJob(id);
      setJob(data);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to load job details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setNotification(null);

    try {
      await applicationService.applyJob(job.id, coverLetter);
      setNotification({
        type: 'success',
        message: 'Application submitted successfully! Track progress in "My Applications".',
      });
      setShowApplyModal(false);
      await fetchJob();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit application.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading opportunity..." size="lg" />;
  }

  if (!job) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <Link to="/jobs" className="text-sm font-semibold text-blue-600">
          Back to Listings
        </Link>
      </div>
    );
  }

  const matchAnalysis = job.match_analysis;
  const hasApplied = job.has_applied;
  const applicationStatus = job.application_status;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to all jobs
      </Link>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Job Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {job.job_type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {job.experience_level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Building className="w-4 h-4 text-blue-600" />
                {job.company_name}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location}
              </div>
              {job.salary_range && (
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span>💰 {job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button Area */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            {hasApplied ? (
              <div className="flex flex-col sm:items-end gap-1">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <Check className="w-4 h-4" /> Application Submitted
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Current Status: <span className="font-bold text-blue-600">{applicationStatus}</span>
                </span>
              </div>
            ) : isStudent ? (
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" /> Apply for this Role
              </button>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Sign in to Apply
              </Link>
            ) : null}

            {job.external_url && (
              <a
                href={job.external_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
              >
                External Application Portal <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Skill Match Analysis Card (For Students) */}
        {matchAnalysis && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Your Skill Match Analysis
                </h3>
              </div>
              <MatchScoreBadge score={matchAnalysis.match_score} showBar={false} />
            </div>

            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  matchAnalysis.match_score >= 75
                    ? 'bg-emerald-500'
                    : matchAnalysis.match_score >= 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${matchAnalysis.match_score}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Matched Required Skills (
                  {matchAnalysis.matched_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchAnalysis.matched_skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">None matched yet.</span>
                  ) : (
                    matchAnalysis.matched_skills.map((s) => (
                      <SkillBadge key={s} name={s} variant="matched" size="sm" />
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Missing Skills To Improve (
                  {matchAnalysis.missing_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchAnalysis.missing_skills.length === 0 ? (
                    <span className="text-xs text-emerald-600 font-semibold">
                      100% Skills matched! You are an ideal candidate.
                    </span>
                  ) : (
                    matchAnalysis.missing_skills.map((s) => (
                      <SkillBadge key={s} name={s} variant="missing" size="sm" />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">Job Description</h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* Required Skills Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            All Required Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {(job.required_skills || []).map((skillName) => (
              <SkillBadge key={skillName} name={skillName} variant="default" size="md" />
            ))}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Application to {job.company_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Role: <span className="font-semibold text-slate-800">{job.title}</span>
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Optional Cover Letter / Note to Recruiter
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why your skills and background make you a strong fit for this opportunity..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                Your extracted skills portfolio and latest uploaded resume will be securely forwarded to the recruiter.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
