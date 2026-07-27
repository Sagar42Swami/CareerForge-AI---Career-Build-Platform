import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import Recommendations from './pages/Recommendations';
import SkillGap from './pages/SkillGap';
import CoverLetter from './pages/CoverLetter';
import MarketInsights from './pages/MarketInsights';
import MockInterview from './pages/MockInterview';
import CareerChat from './pages/CareerChat';
import Profile from './pages/Profile';

// Shared Layout for all protected pages
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </ProtectedRoute>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Loading Pathwise..." />;

  return (
    <Routes>
      {/* Public / Unauthenticated Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected Routes inside Shared Layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/market" element={<MarketInsights />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="/chat" element={<CareerChat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback & Root Redirects */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
