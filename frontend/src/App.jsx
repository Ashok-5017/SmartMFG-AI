import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetails from './pages/MachineDetails';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import AIInsights from './pages/AIInsights';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Manufacturing portal routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/machines/:id" element={<MachineDetails />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Fallback redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
