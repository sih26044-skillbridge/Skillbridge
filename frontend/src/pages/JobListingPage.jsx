import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/job.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const JobListingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [skill, setSkill] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (jobType) params.job_type = jobType;
      if (skill.trim()) params.skill = skill.trim();

      const data = await jobService.getJobs(params);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setSkill('');
    jobService.getJobs().then(setJobs);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Open Job & Internship Roles</h1>
        <p className="text-sm text-slate-500">
          Find opportunities posted by verified recruiters across academia and industry
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or keywords..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Location Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or Remote..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Job Type Dropdown */}
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700"
          >
            <option value="">All Job Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>

          {/* Filter Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              <Search className="w-4 h-4" /> Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Listings Result */}
      {loading ? (
        <LoadingSpinner text="Searching jobs..." />
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all available listings.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {job.job_type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{job.company_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {(job.required_skills || []).map((skillName) => (
                      <SkillBadge key={skillName} name={skillName} variant="neutral" size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {job.salary_range || 'Competitive'}
                </span>
                <Link
                  to={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
