import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

export default function MarketInsights() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data, loading, error } = useFetch(async () => {
    const [insightsRes, matchRes] = await Promise.all([
      api.get('/jobs/market-insights').catch(() => ({ data: null })),
      api.get('/jobs/match').catch(() => ({ data: { matches: [], skills: [] } })),
    ]);

    return {
      insights: insightsRes.data,
      matchData: matchRes.data,
    };
  });

  if (loading) return <LoadingSpinner message="Loading market insights & job matches..." />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  const insights = data?.insights || {};
  const matchData = data?.matchData || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Market Insights & Job Matching</h1>
          <p className="text-slate-500">Explore industry trends and AI-driven job role matching</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Market Overview
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'match'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semantic Job Match
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <p className="text-sm text-slate-500">Total Roles Tracked</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{insights.totalRoles ?? 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Average Salary</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ${insights.avgSalary?.toLocaleString() ?? 0}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Top Skill</p>
              <p className="text-xl font-bold text-brand-600 mt-1">
                {insights.trendingSkills?.[0]?.skill ?? '—'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Trending Skills">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={insights.trendingSkills?.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Roles by Category">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={insights.categories}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {insights.categories?.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Salary by Role" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 font-medium text-slate-500">Role</th>
                    <th className="text-right py-2 font-medium text-slate-500">Salary</th>
                    <th className="text-right py-2 font-medium text-slate-500">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.salaryBands?.map((job) => (
                    <tr key={job.title} className="border-b border-slate-50">
                      <td className="py-2.5 text-slate-900">{job.title}</td>
                      <td className="py-2.5 text-right text-green-600 font-medium">
                        ${job.salary?.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs">
                          {job.demandScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <Card title="Your Matching Profile">
            <p className="text-sm text-slate-500 mb-3">
              Semantic matching ranks roles based on your extracted resume skills.
            </p>
            <div className="flex flex-wrap gap-2">
              {(matchData.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {(!matchData.skills || matchData.skills.length === 0) && (
                <p className="text-sm text-slate-400">No skills detected. Upload a resume to see matching jobs.</p>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchData.matches?.map((match, i) => (
              <Card key={match.title + i} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-slate-900">{match.title}</h3>
                    <span className="px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full font-bold text-sm">
                      {match.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{match.description}</p>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(match.skills || []).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                  {match.salary > 0 && (
                    <p className="text-sm font-medium text-green-600">
                      Average Salary: ${match.salary.toLocaleString()}
                    </p>
                  )}
                </div>
              </Card>
            ))}
            {(!matchData.matches || matchData.matches.length === 0) && (
              <div className="col-span-2 text-center py-12 text-slate-500">
                No matching roles found. Try updating your skills or uploading a new resume.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
