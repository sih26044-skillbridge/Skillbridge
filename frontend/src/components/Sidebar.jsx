import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  User,
  Sparkles,
  Send,
  PlusCircle,
  Briefcase,
  Users,
  Settings,
  Search,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isStudent, isRecruiter, isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Recommended Jobs', to: '/student/recommendations', icon: Sparkles, highlight: true },
    { name: 'Upload Resume', to: '/student/resume-upload', icon: FileText },
    { name: 'My Profile & Skills', to: '/student/profile', icon: User },
    { name: 'Browse All Jobs', to: '/jobs', icon: Search },
    { name: 'My Applications', to: '/student/applications', icon: Send },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', to: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Post New Opportunity', to: '/recruiter/post-job', icon: PlusCircle, highlight: true },
    { name: 'Manage Job Listings', to: '/recruiter/jobs', icon: Briefcase },
    { name: 'Browse All Jobs', to: '/jobs', icon: Search },
  ];

  const adminLinks = [
    { name: 'Admin Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Platform Users', to: '/admin/users', icon: Users },
    { name: 'All Job Postings', to: '/jobs', icon: Briefcase },
  ];

  let links = [];
  if (isStudent) links = studentLinks;
  else if (isRecruiter) links = recruiterLinks;
  else if (isAdmin) links = adminLinks;
  else {
    links = [
      { name: 'Browse Jobs', to: '/jobs', icon: Search },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-blue-600' : ''}`} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* SIH Hackathon Info Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              SIH26044 MVP
            </p>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            Academia–Industry Skill Mapping & Placement Engine with Node.js & pdf-parse.
          </p>
        </div>
      </div>

      {/* User Quick Info */}
      {user && (
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {user.student_profile?.full_name || user.recruiter_profile?.company_name || user.username}
              </span>
              <span className="text-[11px] text-slate-500 capitalize">{user.role} Account</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
