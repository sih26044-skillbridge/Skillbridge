import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/job.service';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/SkillBadge';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Django',
  'Node.js', 'SQL', 'PostgreSQL', 'MongoDB', 'Machine Learning',
  'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch', 'Pandas',
  'NumPy', 'Excel', 'Power BI', 'Tableau', 'AWS', 'Docker',
  'Kubernetes', 'Git', 'HTML', 'CSS',
];

export const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company_name: user?.recruiter_profile?.company_name || '',
    description: '',
    location: user?.recruiter_profile?.location || '',
    job_type: 'Internship',
    experience_level: 'Entry-level',
    salary_range: '',
    application_deadline: '',
    external_url: '',
  });

  const [skills, setSkills] = useState(['Python', 'SQL']);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (skillToAdd) => {
    const val = (skillToAdd || skillInput).trim();
    if (!val) return;
    if (!skills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setSkills([...skills, val]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (skills.length === 0) {
      setError('Please add at least one required skill for this posting.');
      return;
    }

    setLoading(true);

    try {
      await jobService.createJob({
        ...formData,
        skills,
      });
      navigate('/recruiter/jobs');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create job posting. Please check all fields.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a Job or Internship Opportunity</h1>
        <p className="text-sm text-slate-500">
          Specify role requirements and skills for automated student matching and candidate ranking
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Job / Internship Title *
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Full Stack Python/React Developer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. TechCorp Solutions"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Type *
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Experience Level *
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
              >
                <option value="Intern">Intern</option>
                <option value="Entry-level">Entry-level (0-1 yrs)</option>
                <option value="Mid-level">Mid-level (2-4 yrs)</option>
                <option value="Senior-level">Senior-level (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Location *
              </label>
              <input
                type="text"
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru / Remote"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Stipend / Salary Range
              </label>
              <input
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="e.g. ₹25,000 / month or ₹6-8 LPA"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Description & Responsibilities *
            </label>
            <textarea
              required
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, day-to-day responsibilities, learning outcomes, and expectations..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Optional External Application URL
            </label>
            <input
              type="url"
              name="external_url"
              value={formData.external_url}
              onChange={handleChange}
              placeholder="https://company.careers/apply/123"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Skill Tagging Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Required Skills for Candidate Matching *
                </label>
                <p className="text-xs text-slate-500">
                  These skills form the basis of the match score calculation: (matched / required) × 100
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {skills.length} Selected
              </span>
            </div>

            {/* Currently Selected Skills */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[50px] items-center">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills selected yet.</span>
              ) : (
                skills.map((s) => (
                  <SkillBadge
                    key={s}
                    name={s}
                    variant="removable"
                    onRemove={() => handleRemoveSkill(s)}
                  />
                ))
              )}
            </div>

            {/* Add Custom Skill */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type a skill..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Add Skill
              </button>
            </div>

            {/* Common Skill Quick Tags */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Add Common Skills:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {COMMON_SKILLS.filter(
                  (cs) => !skills.some((s) => s.toLowerCase() === cs.toLowerCase())
                ).map((cs) => (
                  <button
                    key={cs}
                    type="button"
                    onClick={() => handleAddSkill(cs)}
                    className="px-2.5 py-1 rounded-full text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 border border-slate-200 transition-colors"
                  >
                    + {cs}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Opportunity'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
