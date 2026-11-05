import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/job.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import {
  Briefcase,
  Users,
  PlusCircle,
  Building,
  MapPin,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle,
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        const jobsData = await jobService.getRecruiterJobs();
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching recruiter jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading recruiter workspace..." size="lg" />;
  }

  const activeJobs = jobs.filter((j) => j.is_active);
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0);
  const companyName = user?.recruiter_profile?.company_name || 'Your Company';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs">
            <Building className="w-3.5 h-3.5 text-indigo-300" />
            Recruiter & Employer Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {companyName} Hiring Workspace
          </h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Post opportunities, evaluate verified skill proficiencies, and review candidate applications.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          Post New Role
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Postings</p>
            <p className="text-2xl font-extrabold text-slate-900">{activeJobs.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Candidates Applied</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalApplicants}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Roles Created</p>
            <p className="text-2xl font-extrabold text-slate-900">{jobs.length}</p>
          </div>
        </div>
      </div>

      {/* Your Job Postings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Opportunities</h2>
            <p className="text-xs text-slate-500">
              Manage postings and inspect candidate applicant pools
            </p>
          </div>

          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Manage All Listings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No jobs posted yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post an internship or job with required skills to connect with students.
            </p>
            <Link
              to="/recruiter/post-job"
              className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Role Title</th>
                  <th className="px-4 py-3">Type & Location</th>
                  <th className="px-4 py-3">Required Skills</th>
                  <th className="px-4 py-3">Applicants</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <span className="text-[11px] text-slate-400">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div>{job.job_type}</div>
                      <div className="text-slate-400">{job.location}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(job.required_skills || []).slice(0, 3).map((sk) => (
                          <SkillBadge key={sk} name={sk} variant="neutral" size="sm" />
                        ))}
                        {(job.required_skills || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{(job.required_skills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {job.applications_count || 0} Applicants
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5" /> View Candidates
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
