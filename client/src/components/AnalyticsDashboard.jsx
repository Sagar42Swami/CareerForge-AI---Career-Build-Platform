import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

export default function AnalyticsDashboard({ trainingMetrics, performanceData }) {
  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md space-y-8">
      <h2 className="text-2xl font-bold">Model Evaluation & Analytics</h2>
      
      {/* Training Loss/Accuracy Curve */}
      <div className="h-72 w-full">
        <h3 className="text-lg font-semibold mb-2">Training vs Validation Progress</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trainingMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="epoch" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }} />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="val_accuracy" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Class Performance Bar Chart */}
      <div className="h-72 w-full">
        <h3 className="text-lg font-semibold mb-2">Classification Metrics</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="class" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }} />
            <Legend />
            <Bar dataKey="precision" fill="#8B5CF6" />
            <Bar dataKey="recall" fill="#EC4899" />
            <Bar dataKey="f1Score" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
