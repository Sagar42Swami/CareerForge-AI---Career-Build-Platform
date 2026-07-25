import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const { user } = useAuth();

  const { data, loading, error } = useFetch(async () => {
    const [recRes, resumeRes] = await Promise.all([
      api.get(`/recommendations/${user.id}`).catch(() => ({ data: { recommendation: null } })),
      api.get('/resume/latest').catch(() => ({ data: { resume: null } })),
    ]);
    return {
      recommendation: recRes.data.recommendation,
      resume: resumeRes.data.resume,
    };
  }, [user.id]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  const { recommendation, resume } = data;
  const topRole = recommendation?.recommendedRoles?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-slate-500 mt-1">Your career guidance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-slate-500">ATS Score</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">
            {resume?.atsScore ?? '—'}
            {resume?.atsScore != null && <span className="text-lg text-slate-400">/100</span>}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Skills Detected</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {resume?.extractedSkills?.length ?? user.skills?.length ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Top Match</p>
          <p className="text-lg font-bold text-slate-900 mt-1 truncate">
            {topRole?.title ?? 'Upload resume'}
          </p>
          {topRole && (
            <p className="text-sm text-brand-600">{topRole.matchScore}% match</p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Skill Gaps</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {recommendation?.skillGaps?.length ?? 0}
          </p>
        </Card>
      </div>

      {!resume ? (
        <EmptyState
          title="No resume uploaded yet"
          description="Upload your resume to unlock personalized recommendations, ATS scoring, and skill gap analysis."
          action={
            <Link to="/resume" className="btn-primary">
              Upload Resume
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Your Skills">
            <div className="flex flex-wrap gap-2">
              {(resume.extractedSkills || user.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link to="/recommendations" className="btn-secondary text-center text-sm">
                Recommendations
              </Link>
              <Link to="/skill-gap" className="btn-secondary text-center text-sm">
                Skill Gap
              </Link>
              <Link to="/cover-letter" className="btn-secondary text-center text-sm">
                Cover Letter
              </Link>
              <Link to="/market" className="btn-secondary text-center text-sm">
                Job Matching
              </Link>
              <Link to="/interview" className="btn-secondary text-center text-sm">
                Mock Interview
              </Link>
              <Link to="/chat" className="btn-secondary text-center text-sm">
                Career Chat
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
