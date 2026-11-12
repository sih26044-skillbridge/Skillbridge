import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/student.service';
import { SkillBadge } from '../components/SkillBadge';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  FileCheck,
} from 'lucide-react';

export const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setResult(null);
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF document (.pdf).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const response = await studentService.uploadResume(file);
      setResult(response);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to parse resume. Please ensure it is a valid PDF.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Resume & Auto-Extract Skills</h1>
        <p className="text-sm text-slate-500">
          pdf-parse scans your PDF resume, identifies technical proficiencies, normalizes aliases, and recalculates job matches
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : file
              ? 'border-emerald-400 bg-emerald-50/20'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
          }`}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
                file
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {file ? <FileCheck className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB • PDF Document Ready
                </p>
                <label
                  htmlFor="resume-file-input"
                  className="inline-block text-xs text-blue-600 hover:underline cursor-pointer font-medium mt-1"
                >
                  Choose a different file
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-base font-bold text-slate-800">
                  Drag and drop your PDF resume here
                </p>
                <p className="text-xs text-slate-500">Supports PDF documents up to 10MB</p>
                <label
                  htmlFor="resume-file-input"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Browse Files
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing PDF & Extracting Skills...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Skills with AI Parser
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parse Result Banner */}
      {result && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-md space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Resume Successfully Processed!
                </h3>
                <p className="text-xs text-slate-500">{result.message}</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {result.extracted_skills.length} Skills Detected
            </span>
          </div>

          {/* Newly Identified Skills */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Identified & Normalized Technical Skills:
            </h4>
            {result.extracted_skills.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No matching skills from the canonical catalog were identified in this document. You can add skills manually in your profile.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.extracted_skills.map((skillName) => (
                  <SkillBadge key={skillName} name={skillName} variant="matched" size="md" />
                ))}
              </div>
            )}
          </div>

          {/* Extracted Text Preview */}
          {result.extracted_text_preview && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Raw Text Preview (pdf-parse):
              </h4>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                {result.extracted_text_preview}
              </pre>
            </div>
          )}

          {/* Next Steps CTA */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-600">
              All extracted skills have been synced with your placement profile.
            </span>
            <Link
              to="/student/recommendations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              View Updated Job Matches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
