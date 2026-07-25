import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Card from '../components/Card';
import ChatBubble from '../components/ChatBubble';

const SUGGESTIONS = [
  'What skills should I focus on for a backend role?',
  'How do I transition from frontend to full stack?',
  'What is the job market like for data scientists?',
  'How can I improve my resume for ATS systems?',
];

export default function CareerChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = text.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat', {
        message: userMsg,
        sessionId,
      });
      setSessionId(data.sessionId);
      setMessages(data.messages.filter((m) => m.role !== 'system'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Career Counselor</h1>
      <p className="text-slate-500 mb-8">Ask anything about careers, skills, and job market trends</p>

      <Card>
        <div className="h-96 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-slate-400 mb-4">Start a conversation with your AI career counselor</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-sm px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <ChatBubble key={i} role={msg.role} content={msg.content} />)
          )}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask about careers, skills, transitions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </Card>
    </div>
  );
}
