import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import ChatBubble from '../components/ChatBubble';

export default function MockInterview() {
  const [role, setRole] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastScore, setLastScore] = useState(null);

  const startInterview = async (e) => {
    e.preventDefault();
    if (!role.trim()) return toast.error('Enter a target role');

    setLoading(true);
    try {
      const { data } = await api.post('/interview/start', { role: role.trim() });
      setSessionId(data.sessionId);
      setMessages([{ role: 'assistant', content: data.question }]);
      setCompleted(false);
      toast.success('Interview started!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !sessionId) return;

    setLoading(true);
    const userAnswer = answer.trim();
    setAnswer('');
    setMessages((prev) => [...prev, { role: 'user', content: userAnswer }]);

    try {
      const { data } = await api.post('/interview/answer', {
        sessionId,
        answer: userAnswer,
      });

      setLastScore(data.evaluation?.score);
      setMessages(data.messages.filter((m) => m.role !== 'system'));

      if (data.completed) {
        setCompleted(true);
        toast.success('Interview complete!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSessionId(null);
    setMessages([]);
    setRole('');
    setCompleted(false);
    setLastScore(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Mock Interview</h1>
      <p className="text-slate-500 mb-8">Practice interview questions with AI feedback</p>

      {!sessionId ? (
        <Card>
          <form onSubmit={startInterview} className="space-y-4">
            <div>
              <label className="label">Target Role</label>
              <input
                className="input"
                placeholder="e.g. Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </form>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">
                Interviewing for: <strong className="text-slate-900">{role}</strong>
              </span>
              {lastScore != null && (
                <span className="text-sm font-medium text-brand-600">
                  Last score: {lastScore}/100
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto mb-4">
              {messages.map((msg, i) => (
                <ChatBubble key={i} role={msg.role} content={msg.content} />
              ))}
            </div>

            {!completed ? (
              <form onSubmit={submitAnswer} className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Type your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="btn-primary" disabled={loading || !answer.trim()}>
                  Submit
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-medium text-slate-900 mb-2">Interview Complete!</p>
                <button onClick={reset} className="btn-primary">
                  Start New Interview
                </button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
