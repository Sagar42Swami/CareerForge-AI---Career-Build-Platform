import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    targetRoles: (user?.targetRoles || []).join(', '),
    skills: (user?.skills || []).join(', '),
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: form.name,
        targetRoles: form.targetRoles
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile</h1>
      <p className="text-slate-500 mb-8">Manage your career goals and skills</p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">Target Roles (comma-separated)</label>
            <input
              name="targetRoles"
              className="input"
              placeholder="Frontend Developer, Product Manager"
              value={form.targetRoles}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label">Skills (comma-separated)</label>
            <input
              name="skills"
              className="input"
              placeholder="JavaScript, React, Python"
              value={form.skills}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Card>

      <Card title="Progress Tracker" className="mt-6">
        <div className="space-y-3">
          <ProgressItem label="Account created" done />
          <ProgressItem label="Profile completed" done={!!user?.name} />
          <ProgressItem label="Target roles set" done={user?.targetRoles?.length > 0} />
          <ProgressItem label="Skills added" done={user?.skills?.length > 0} />
        </div>
      </Card>
    </div>
  );
}

function ProgressItem({ label, done }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          done ? 'bg-green-500' : 'bg-slate-200'
        }`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={done ? 'text-slate-900' : 'text-slate-400'}>{label}</span>
    </div>
  );
}
