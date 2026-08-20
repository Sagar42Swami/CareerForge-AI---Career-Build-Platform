import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

export default function SkillGap() {
  const { user } = useAuth();

  const { data, loading, error } = useFetch(async () => {
    const { data: res } = await api.get(`/recommendations/${user.id}`);
    return res.recommendation;
  }, [user.id]);

  if (loading) return <LoadingSpinner message="Analyzing skill gaps..." />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  if (!data?.skillGaps?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <EmptyState
          title="No skill gaps identified"
          description="Upload your resume and generate recommendations to see skill gap analysis."
        />
      </div>
    );
  }

  const barData = data.skillGaps.map((g) => ({
    skill: g.skill.length > 15 ? g.skill.slice(0, 15) + '…' : g.skill,
    priority: g.priority === 'high' ? 3 : g.priority === 'medium' ? 2 : 1,
    fill: PRIORITY_COLORS[g.priority] || PRIORITY_COLORS.medium,
  }));

  const radarData = data.skillGaps.slice(0, 8).map((g) => ({
    skill: g.skill.length > 12 ? g.skill.slice(0, 12) + '…' : g.skill,
    gap: g.priority === 'high' ? 90 : g.priority === 'medium' ? 60 : 30,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Skill Gap Analysis</h1>
      <p className="text-slate-500 mb-8">
        Skills to develop for your target role: {data.skillGaps[0]?.targetRole}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Gap Priority (Bar)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v) => ['', 'Low', 'Med', 'High'][v]} />
              <YAxis type="category" dataKey="skill" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => ['', 'Low', 'Medium', 'High'][v]} />
              <Bar dataKey="priority" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Gap Overview (Radar)">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              <Radar dataKey="gap" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Detailed Gaps">
        <div className="space-y-3">
          {data.skillGaps.map((gap) => (
            <div
              key={gap.skill}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
            >
              <span className="font-medium text-slate-900">{gap.skill}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  gap.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : gap.priority === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {gap.priority}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
