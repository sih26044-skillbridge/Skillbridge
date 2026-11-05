import React, { useState, useEffect } from 'react';
import { studentService } from '../services/student.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SkillBadge } from '../components/SkillBadge';
import {
  User,
  School,
  MapPin,
  Briefcase,
  Calendar,
  Save,
  Plus,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'Python', 'Java', 'JavaScript', 'React', 'Django', 'Node.js',
  'SQL', 'PostgreSQL', 'MongoDB', 'Machine Learning', 'Deep Learning',
  'NLP', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Excel',
  'Power BI', 'Tableau', 'AWS', 'Docker', 'Git', 'HTML', 'CSS',
];

export const StudentProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    college: '',
    degree: '',
    graduation_year: '',
    location: '',
    preferred_role: '',
    bio: '',
  });

  const fetchProfile = async () => {
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        college: data.college || '',
        degree: data.degree || '',
        graduation_year: data.graduation_year || '',
        location: data.location || '',
        preferred_role: data.preferred_role || '',
        bio: data.bio || '',
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const updated = await studentService.updateProfile({
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : null,
      });
      setProfile(updated);
      setNotification({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to save changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillToAdd) => {
    const name = (skillToAdd || newSkillName).trim();
    if (!name) return;

    try {
      await studentService.addSkill(name);
      setNewSkillName('');
      setNotification({ type: 'success', message: `Added skill: ${name}` });
      await fetchProfile();
    } catch (err) {
      setNotification({ type: 'error', message: 'Could not add skill.' });
    }
  };

  const handleRemoveSkill = async (skillId, skillName) => {
    try {
      await studentService.deleteSkill(skillId);
      setNotification({ type: 'info', message: `Removed skill: ${skillName}` });
      await fetchProfile();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete skill.' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." size="lg" />;
  }

  const existingSkillNames = new Set((profile?.skills || []).map((s) => s.name.toLowerCase()));
  const unselectedSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !existingSkillNames.has(s.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile & Skill Inventory</h1>
        <p className="text-sm text-slate-500">
          Manage your academic background, career preferences, and technical skills
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
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

      {/* Profile Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Academic & Personal Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target / Preferred Role
              </label>
              <input
                type="text"
                name="preferred_role"
                value={formData.preferred_role}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer / Data Scientist"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                College / University
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Degree & Branch
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Professional Summary / Bio
            </label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell recruiters about your background, projects, and career aspirations..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Your Technical Skills</h2>
              <p className="text-xs text-slate-500">
                Skills can be extracted from your resume or added manually below
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {profile?.skills?.length || 0} Total Skills
          </span>
        </div>

        {/* Current Active Skills */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Skills on Profile
          </h3>
          {(profile?.skills || []).length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No skills added yet. Add manually or upload a resume to populate automatically.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <SkillBadge
                  key={s.id}
                  name={s.name}
                  variant="removable"
                  onRemove={() => handleRemoveSkill(s.skill_id, s.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Skill Manually */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Add a Skill Manually
          </h3>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. Docker, TypeScript, PyTorch"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Quick-Add Suggestions */}
        {unselectedSuggestions.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Suggested Canonical Skills (Click to Add):
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {unselectedSuggestions.slice(0, 16).map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => handleAddSkill(suggested)}
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  {suggested}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
