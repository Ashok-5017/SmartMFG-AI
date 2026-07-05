import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-screen flex items-center justify-center bg-dark-bg text-dark-text">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-dark-muted">Loading manufacturing systems...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main app content wrap */}
      <div className="flex-1 flex flex-col pl-64">
        {/* Top navigation bar */}
        <Navbar />

        {/* Dynamic page outlet */}
        <main className="flex-grow pt-24 px-8 pb-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
