import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../services/recommendation.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import {
  Sparkles,
  Building,
  MapPin,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  User,
  CheckCircle,
} from 'lucide-react';

export const RecommendedJobsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationService.getRecommendations();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to compute job recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Calculating deterministic skill match rankings..." size="lg" />;
  }

  const recommendations = data?.recommendations || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Formula Explanation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Deterministic Placement Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Personalized Job & Internship Recommendations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Matching your verified skill set against active industry requirements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/resume-upload"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Re-parse Resume
            </Link>
            <Link
              to="/student/profile"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5" /> Edit Skills
            </Link>
          </div>
        </div>

        {/* SIH Algorithm Formula Note */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div>
            <span className="font-bold">Transparent Scoring Algorithm:</span>{' '}
            <code className="bg-white/80 px-2 py-0.5 rounded font-mono text-[11px] text-blue-800">
              Match Score = (Matched Required Skills / Total Required Skills) × 100
            </code>
          </div>
          <span className="text-blue-700 font-semibold shrink-0">
            {data?.student_skills_count || 0} Skills on your profile
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active recommendations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload a resume or add skills to your profile to let our matching algorithm rank open roles for you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((item, index) => {
            const job = item.job;
            return (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {job.job_type}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {job.experience_level}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        {job.company_name}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      {job.salary_range && (
                        <span className="font-semibold text-emerald-700">
                          {job.salary_range}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <MatchScoreBadge score={item.match_score} showBar={true} />
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.matched_skills.length} of {item.total_required} required skills
                    </span>
                  </div>
                </div>

                {/* Skills Analysis Breakout */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
                  {item.matched_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1 mr-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Matched:
                      </span>
                      {item.matched_skills.map((s) => (
                        <SkillBadge key={s} name={s} variant="matched" size="sm" />
                      ))}
                    </div>
                  )}

                  {item.missing_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-rose-800 flex items-center gap-1 mr-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Missing Skills To Improve:
                      </span>
                      {item.missing_skills.map((s) => (
                        <SkillBadge key={s} name={s} variant="missing" size="sm" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-2">
                    {job.has_applied ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        ✓ Applied
                      </span>
                    ) : (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        Review & Apply <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
