import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (role === 'recruiter') {
      return (
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
          <Briefcase className="w-3 h-3" /> Recruiter
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Student
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Skill<span className="text-blue-600">Bridge</span>
                </span>
                <span className="text-[10px] text-slate-600 font-medium tracking-wide">
                  Academia–Industry Collaboration
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {getRoleBadge(user?.role)}
                
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 leading-none">
                    {user?.student_profile?.full_name || user?.recruiter_profile?.company_name || user?.username}
                  </span>
                  <span className="text-xs text-slate-600">{user?.email}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/jobs"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/student"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
