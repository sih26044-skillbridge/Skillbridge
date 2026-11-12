import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  ExternalLink,
  GraduationCap,
  Building,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowRight,
  Clock,
  ToggleLeft,
  ToggleRight,
  Calendar,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingJobId, setTogglingJobId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const dashData = await adminService.getDashboard();
      setData(dashData);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleJob = async (jobId) => {
    try {
      setTogglingJobId(jobId);
      const res = await adminService.toggleJobActive(jobId);
      setNotification({ type: 'success', message: res.message });
      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        const updatedRecentJobs = (prev.recent_jobs || []).map((j) =>
          j.id === jobId ? { ...j, is_active: res.is_active } : j
        );
        const activeCountChange = res.is_active ? 1 : -1;
        return {
          ...prev,
          recent_jobs: updatedRecentJobs,
          statistics: {
            ...prev.statistics,
            active_jobs: (prev.statistics?.active_jobs || 0) + activeCountChange,
          },
        };
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update job status.' });
    } finally {
      setTogglingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = data?.statistics || {};
  const statusBreakdown = data?.application_status_breakdown || [];
  const recentJobs = data?.recent_jobs || [];
  const recentApplications = data?.recent_applications || [];
  const recentUsers = data?.recent_users || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <Shield className="w-3.5 h-3.5 text-purple-300" />
            Platform Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SkillBridge Control Center
          </h1>
          <p className="text-purple-200 text-sm max-w-xl">
            Real-time analytics across colleges, corporate recruiters, applicants, and skill mapping.
          </p>
        </div>

        <a
          href="http://localhost:5555"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors shrink-0"
          title="Prisma Studio visual DB editor (run 'npm run db:studio' in backend)"
        >
          <Database className="w-3.5 h-3.5" />
          Open Prisma Studio <ExternalLink className="w-3.5 h-3.5 opacity-75" />
        </a>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          to="/admin/users"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Students</p>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.total_students || 0}</p>
        </Link>

        <Link
          to="/admin/users"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Recruiters</p>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.total_recruiters || 0}</p>
        </Link>

        <Link
          to="/jobs"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Jobs</p>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_jobs || 0}</p>
        </Link>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Applications</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.total_applications || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Resumes</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{stats.total_resumes || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Skill Catalog</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.total_skills || 0}</p>
        </div>
      </div>

      {/* Application Funnel Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Placement Application Distribution</h2>
          <span className="text-xs text-slate-500">5-Stage Recruitment Funnel</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'].map((statusKey) => {
            const found = statusBreakdown.find((s) => s.status === statusKey);
            const count = found ? found.count : 0;
            const badgeColor =
              statusKey === 'Selected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusKey === 'Shortlisted'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : statusKey === 'Under Review'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : statusKey === 'Rejected'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-700';

            return (
              <div key={statusKey} className={`p-4 rounded-2xl border text-center ${badgeColor}`}>
                <p className="text-xs font-semibold uppercase tracking-wider">{statusKey}</p>
                <p className="text-2xl font-extrabold mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Recent Jobs Moderation & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs Moderation */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Job Postings</h2>
              <p className="text-xs text-slate-500">Moderate and toggle active status</p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentJobs.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No jobs posted yet.</p>
            ) : (
              recentJobs.map((j) => (
                <div key={j.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{j.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {j.company_name} • {j.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleJob(j.id)}
                      disabled={togglingJobId === j.id}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        j.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {j.is_active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Applications Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-500">Live student submissions feed</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              {stats.total_applications || 0} Total
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApplications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No applications received yet.</p>
            ) : (
              recentApplications.map((a) => (
                <div key={a.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{a.student_name || 'Candidate'}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      applied for <span className="font-semibold text-slate-700">{a.job_title}</span> ({a.company_name})
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 capitalize ${
                      a.status === 'Selected'
                        ? 'bg-emerald-50 text-emerald-700'
                        : a.status === 'Shortlisted'
                        ? 'bg-blue-50 text-blue-700'
                        : a.status === 'Under Review'
                        ? 'bg-amber-50 text-amber-700'
                        : a.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Platform Users Quick Preview Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform Users Directory</h2>
            <p className="text-xs text-slate-500">
              Manage accounts, roles, student placement records, and corporate recruiter profiles.
            </p>
          </div>
        </div>

        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all shrink-0 hover:scale-105"
        >
          View All Users Directory ({stats.total_students + stats.total_recruiters + 1 || 0})
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
