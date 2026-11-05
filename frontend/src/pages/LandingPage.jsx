import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Briefcase,
  FileText,
  TrendingUp,
  ShieldCheck,
  Building,
  GraduationCap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isStudent, isRecruiter, isAdmin } = useAuth();

  const getDashboardLink = () => {
    if (isStudent) return '/student/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Smart India Hackathon 2024 — Problem Statement SIH26044
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Bridging the Gap Between <span className="text-blue-400">Academia</span> & <span className="text-indigo-300">Industry</span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            An automated skill mapping, internship, and placement ecosystem. Upload your resume, automatically extract skills with PyMuPDF, discover verified job matches, and eliminate the employment gap.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                Go to Your Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register/student"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  <GraduationCap className="w-5 h-5" />
                  Join as Student
                </Link>
                <Link
                  to="/register/recruiter"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 backdrop-blur-sm transition-all"
                >
                  <Building className="w-5 h-5 text-indigo-300" />
                  Hire as Recruiter
                </Link>
              </>
            )}
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium transition-colors"
            >
              Browse Open Positions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            How SkillBridge Works
          </h2>
          <p className="text-slate-600">
            A transparent, skill-centric pipeline for students, educational institutions, and recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">1. Instant Resume Parsing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload your PDF resume. Our PyMuPDF-powered backend automatically extracts skills, normalizes acronyms (e.g., ML → Machine Learning, JS → JavaScript), and populates your profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">2. Deterministic Matching</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transparent match score calculated by (matched skills / total required skills) × 100. Clearly view exactly which required skills you have and which skills you are missing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">3. Direct Placement & Hiring</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Apply in one click. Recruiters post verified internships and jobs, inspect candidates’ skill inventories, and manage application progression through five distinct stages.
            </p>
          </div>
        </div>
      </section>

      {/* Role Comparison Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <GraduationCap className="w-6 h-6" />
            <h3 className="text-xl">For Students & Colleges</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              Upload PDF resumes with automatic skill extraction
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              Identify missing skills to improve employability
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              Personalized job & internship recommendations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              Track real-time status of all job applications
            </li>
          </ul>
          <div className="pt-2">
            <Link
              to="/register/student"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Register as Student <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <Building className="w-6 h-6" />
            <h3 className="text-xl">For Industry Recruiters</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              Post internships and jobs with structured skill criteria
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              Filter applicants with automated skill match ranking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              Review candidate resumes and validated proficiencies
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              Update applicant stage: Under Review, Shortlisted, Selected
            </li>
          </ul>
          <div className="pt-2">
            <Link
              to="/register/recruiter"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Register as Recruiter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
