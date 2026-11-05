import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      // Redirect based on role or prior route
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-2">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back to SkillBridge
          </h2>
          <p className="text-sm text-slate-600">
            Sign in to access your skills dashboard, job matches, or recruiter portal
          </p>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Quick Demo Accounts (1-Click Fill for Judges):
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('arjun_student', 'student123')}
              className="p-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 text-blue-800 font-semibold text-center transition-colors"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('techcorp_recruiter', 'recruiter123')}
              className="p-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-semibold text-center transition-colors"
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="p-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 font-semibold text-center transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. arjun_student or user@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <p>
              Don't have an account yet?
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register/student" className="font-semibold text-blue-600 hover:text-blue-700">
                Register as Student
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/register/recruiter" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Register as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
