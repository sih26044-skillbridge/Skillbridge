import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/job.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import {
  Briefcase,
  Users,
  PlusCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getRecruiterJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to load recruiter listings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await jobService.deleteJob(jobId);
      setNotification({ type: 'success', message: `Job "${title}" deleted successfully.` });
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete job posting.' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your listings..." size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Job Postings</h1>
          <p className="text-sm text-slate-500">
            View applications, inspect candidates, or remove existing listings
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Job
        </Link>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No jobs posted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by posting your company's internship or full-time opportunities.
          </p>
          <Link
            to="/recruiter/post-job"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Post a Job Now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Title & Type</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Required Skills</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase">
                        {job.job_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {job.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(job.required_skills || []).map((s) => (
                          <SkillBadge key={s} name={s} variant="neutral" size="sm" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {job.applications_count || 0} Candidates
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        target="_blank"
                        title="View Public Listing"
                        className="p-1.5 inline-block text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id, job.title)}
                        title="Delete Job"
                        className="p-1.5 inline-block text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
