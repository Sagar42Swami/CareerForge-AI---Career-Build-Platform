import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Recommendations() {
  const { user } = useAuth();

  const { data, loading, error, refetch } = useFetch(async () => {
    const { data: res } = await api.get(`/recommendations/${user.id}`);
    return res.recommendation;
  }, [user.id]);

  const handleRefresh = async () => {
    try {
      toast.loading('Generating fresh recommendations...');
      await api.post('/recommendations/refresh');
      toast.dismiss();
      toast.success('Recommendations updated!');
      refetch();
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.error || 'Refresh failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading recommendations..." />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  if (!data?.recommendedRoles?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <EmptyState
          title="No recommendations yet"
          description="Upload your resume first, then we'll generate personalized career path suggestions."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Recommendations</h1>
          <p className="text-slate-500 mt-1">AI-powered career paths ranked by fit</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary">
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {data.recommendedRoles.map((role, i) => (
          <Card key={role.title}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{role.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{role.reasoning}</p>
                  {role.avgSalary > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Avg. salary: ${role.avgSalary.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-brand-600">{role.matchScore}%</span>
                <p className="text-xs text-slate-400">match</p>
              </div>
            </div>
            <div className="mt-3 bg-slate-100 rounded-full h-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all"
                style={{ width: `${role.matchScore}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      {data.resources?.length > 0 && (
        <Card title="Learning Resources" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.resources.map((r) => (
              <a
                key={r.skill + r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{r.title}</p>
                  <p className="text-sm text-slate-500">
                    {r.skill} · {r.type}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
