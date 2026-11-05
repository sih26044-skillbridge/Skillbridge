import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobService } from '../services/job.service';
import { applicationService } from '../services/application.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import {
  Users,
  Building,
  GraduationCap,
  Mail,
  FileText,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const ApplicantsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await jobService.getJobApplicants(id);
      setData(res);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to load applicant list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    setNotification(null);

    try {
      await applicationService.updateStatus(appId, newStatus);
      setNotification({
        type: 'success',
        message: `Candidate status updated to "${newStatus}".`,
      });
      // Update local state
      setData((prev) => ({
        ...prev,
        applicants: prev.applicants.map((a) =>
          a.id === appId ? { ...a, status: newStatus } : a
        ),
      }));
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update application status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching candidate profiles & skill scores..." size="lg" />;
  }

  const job = data?.job;
  const applicants = data?.applicants || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Job Listings
      </Link>

      {/* Opportunity Overview Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Candidate Pipeline
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">{job?.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {job?.company_name} • {job?.location} • {job?.job_type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-sm font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {applicants.length} Total Applicants
          </span>
        </div>
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

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications received yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Candidates who match your required skills will appear here as they submit applications.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => {
            const student = app.student_details;
            const resume = student?.latest_resume;
            return (
              <div
                key={app.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900">
                      {student?.full_name || 'Anonymous Student'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        {student?.college || 'College not specified'} ({student?.degree || 'Degree N/A'})
                      </span>
                      {student?.graduation_year && (
                        <span>Class of {student.graduation_year}</span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        {student?.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.match_score !== null && app.match_score !== undefined && (
                      <MatchScoreBadge score={app.match_score} />
                    )}

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Selected">Selected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {app.cover_letter && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 italic">
                    "{app.cover_letter}"
                  </div>
                )}

                {/* Candidate Verified Skills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Candidate Skills Portfolio:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(student?.skills || []).length === 0 ? (
                      <span className="text-xs text-slate-400">No skills listed</span>
                    ) : (
                      student.skills.map((s) => (
                        <SkillBadge key={s} name={s} variant="default" size="sm" />
                      ))
                    )}
                  </div>
                </div>

                {/* Footer with Resume Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                  {resume && resume.file_url ? (
                    <a
                      href={resume.file_url.startsWith('http') ? resume.file_url : `http://127.0.0.1:8000${resume.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Uploaded PDF Resume
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No PDF resume attached</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
