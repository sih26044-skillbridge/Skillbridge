import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
        <Briefcase className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-base font-semibold text-slate-700">Page Not Found</p>
      <p className="text-xs text-slate-500 max-w-sm">
        The requested page could not be located on the SkillBridge platform.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};
