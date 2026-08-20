import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.resume);
      toast.success('Resume parsed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Resume Upload</h1>
      <p className="text-slate-500 mb-8">Upload your resume for AI-powered skill extraction and ATS scoring</p>

      <Card>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Resume File (PDF, DOCX, or TXT)</label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={uploading || !file}>
            {uploading ? 'Analyzing...' : 'Upload & Analyze'}
          </button>
        </form>
      </Card>

      {uploading && <LoadingSpinner message="Extracting skills and calculating ATS score..." />}

      {result && (
        <div className="mt-6 space-y-4">
          <Card title="ATS Score">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#4f46e5"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${result.atsScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-brand-600">
                  {result.atsScore}
                </span>
              </div>
              <div>
                <p className="text-slate-600">
                  {result.atsScore >= 70
                    ? 'Great! Your resume is well-optimized.'
                    : result.atsScore >= 40
                    ? 'Good start. Consider adding more keywords and sections.'
                    : 'Needs improvement. Add contact info, sections, and bullet points.'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Seniority: {result.seniority} · {result.experienceYears} years experience
                </p>
              </div>
            </div>
          </Card>

          <Card title="Extracted Skills">
            <div className="flex flex-wrap gap-2">
              {result.extractedSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
