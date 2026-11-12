import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Shield,
  Users,
  Briefcase,
  Send,
  FileText,
  TrendingUp,
  ExternalLink,
  GraduationCap,
  Building,
  CheckCircle,
  AlertCircle,
  Database,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashData, usersData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers(roleFilter),
      ]);
      setData(dashData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to load administrator telemetry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  if (loading) {
    return <LoadingSpinner text="Aggregating platform metrics & telemetry..." size="lg" />;
  }

  const stats = data?.statistics || {};
  const statusBreakdown = data?.application_status_breakdown || [];

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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors"
          title="Prisma Studio visual DB editor (run 'npm run db:studio' in backend)"
        >
          <Database className="w-3.5 h-3.5" />
          Open Prisma Studio <ExternalLink className="w-3.5 h-3.5 opacity-75" />
        </a>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {notification.message}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Students</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.total_students || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Recruiters</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.total_recruiters || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Jobs</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_jobs || 0}</p>
        </div>

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
        <h2 className="text-base font-bold text-slate-900">Placement Application Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'].map((statusKey) => {
            const found = statusBreakdown.find((s) => s.status === statusKey);
            const count = found ? found.count : 0;
            return (
              <div key={statusKey} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">{statusKey}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registered Platform Users</h2>
            <p className="text-xs text-slate-500">Manage account access and roles</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All User Roles</option>
              <option value="student">Students Only</option>
              <option value="recruiter">Recruiters Only</option>
              <option value="admin">Administrators Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Username & Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Profile Info</th>
                <th className="px-4 py-3">Staff Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{u.username}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.role === 'recruiter'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {u.student_profile
                      ? `${u.student_profile.full_name} (${u.student_profile.college || 'College N/A'})`
                      : u.recruiter_profile
                      ? u.recruiter_profile.company_name
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">
                    {u.is_staff ? (
                      <span className="text-purple-600 font-bold">Staff Access</span>
                    ) : (
                      <span className="text-slate-400">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
