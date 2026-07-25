import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CoverLetter() {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      return toast.error('Please enter a job description');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/resume/cover-letter', {
        jobDescription: jobDescription.trim(),
      });
      setCoverLetter(data.coverLetter);
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">AI Cover Letter Generator</h1>
      <p className="text-slate-500 mb-8">
        Generate a tailored cover letter matched to your uploaded resume and target job description
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Job Details">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="label">Paste Job Description</label>
              <textarea
                className="input h-64 resize-none"
                placeholder="Paste the job requirements, responsibilities, or role description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || !jobDescription.trim()}
            >
              {loading ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </form>
        </Card>

        <Card title="Generated Cover Letter">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner message="Drafting tailored cover letter..." />
            </div>
          ) : coverLetter ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm whitespace-pre-wrap leading-relaxed h-80 overflow-y-auto font-sans">
                {coverLetter}
              </div>
              <button onClick={copyToClipboard} className="btn-secondary w-full">
                Copy to Clipboard
              </button>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <p className="text-sm">Your generated cover letter will appear here.</p>
              <p className="text-xs mt-1 text-slate-400">
                Make sure you have uploaded your resume first.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
