import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Users,
  Search,
  GraduationCap,
  Building,
  Shield,
  Filter,
  CheckCircle,
  Calendar,
  Mail,
  UserCheck,
} from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(roleFilter);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  // Client-side search filtering
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const fullName = (u.student_profile?.full_name || '').toLowerCase();
    const college = (u.student_profile?.college || '').toLowerCase();
    const company = (u.recruiter_profile?.company_name || '').toLowerCase();
    return (
      username.includes(q) ||
      email.includes(q) ||
      fullName.includes(q) ||
      college.includes(q) ||
      company.includes(q)
    );
  });

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalRecruiters = users.filter((u) => u.role === 'recruiter').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <Users className="w-3.5 h-3.5 text-blue-300" />
            User Management Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Users
          </h1>
          <p className="text-blue-200 text-sm max-w-xl">
            Inspect, filter, and monitor all student candidates, corporate recruiters, and administrators across SkillBridge.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-xs border border-white/10">
          <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-[11px] text-blue-200 font-semibold uppercase">Total Registered</p>
            <p className="text-xl font-extrabold text-white">{users.length} Accounts</p>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setRoleFilter('')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs hover:shadow-md ${
            roleFilter === '' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Users</p>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{users.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Platform-wide total</p>
        </div>

        <div
          onClick={() => setRoleFilter('student')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs hover:shadow-md ${
            roleFilter === 'student' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</p>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{totalStudents}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active job seekers</p>
        </div>

        <div
          onClick={() => setRoleFilter('recruiter')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs hover:shadow-md ${
            roleFilter === 'recruiter' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recruiters</p>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{totalRecruiters}</p>
          <p className="text-[11px] text-slate-400 mt-1">Hiring companies</p>
        </div>

        <div
          onClick={() => setRoleFilter('admin')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs hover:shadow-md ${
            roleFilter === 'admin' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrators</p>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">{totalAdmins}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staff permissions</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, college, company..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Roles</option>
            <option value="student">Students Only</option>
            <option value="recruiter">Recruiters Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-base font-bold text-slate-800">No users match your search criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Profile Details</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const initials = (u.username || 'U').slice(0, 2).toUpperCase();
                  const roleBadge =
                    u.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : u.role === 'recruiter'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  const joinedDate = u.date_joined
                    ? new Date(u.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{u.username}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${roleBadge}`}>
                          {u.role === 'student' && <GraduationCap className="w-3 h-3 mr-1" />}
                          {u.role === 'recruiter' && <Building className="w-3 h-3 mr-1" />}
                          {u.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {u.student_profile ? (
                          <div>
                            <p className="font-bold text-slate-800">{u.student_profile.full_name}</p>
                            <p className="text-slate-500">
                              {u.student_profile.college
                                ? `${u.student_profile.college}${u.student_profile.degree ? ` • ${u.student_profile.degree}` : ''}`
                                : 'Academic details not specified'}
                            </p>
                          </div>
                        ) : u.recruiter_profile ? (
                          <div>
                            <p className="font-bold text-slate-800">{u.recruiter_profile.company_name}</p>
                            <p className="text-slate-500">
                              {u.recruiter_profile.location || 'Location not specified'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No extra profile info</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {joinedDate}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                          {u.is_staff && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Staff
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
