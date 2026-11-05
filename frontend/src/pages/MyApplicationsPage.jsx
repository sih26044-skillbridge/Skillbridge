import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/application.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import {
  Send,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await applicationService.getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      Applied: 'bg-blue-50 text-blue-700 border-blue-200',
      'Under Review': 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
      Shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
      Selected: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${
          styles[status] || 'bg-slate-100 text-slate-700'
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Fetching your submitted applications..." size="lg" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Job Applications</h1>
          <p className="text-sm text-slate-500">
            Track stage progression and recruiter reviews for your submissions
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <Briefcase className="w-3.5 h-3.5" /> Browse More Opportunities
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <Send className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore recommended jobs tailored to your skills and submit your first application.
          </p>
          <Link
            to="/student/recommendations"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            View Recommendations
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Opportunity</th>
                  <th className="px-6 py-4">Company & Location</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4">Skill Match</th>
                  <th className="px-6 py-4">Application Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{app.job_details?.title}</div>
                      <span className="text-[11px] font-semibold text-blue-600 uppercase">
                        {app.job_details?.job_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {app.job_details?.company_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.job_details?.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(app.applied_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {app.match_score !== null && app.match_score !== undefined ? (
                        <MatchScoreBadge score={app.match_score} />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/jobs/${app.job_details?.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Job <ExternalLink className="w-3 h-3" />
                      </Link>
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
