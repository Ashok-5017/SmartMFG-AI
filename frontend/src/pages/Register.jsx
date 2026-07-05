import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Mail, User, Lock, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('OPERATOR');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await register(username, email, password, [role]);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-dark-text flex items-center justify-center px-4 relative overflow-hidden blueprint-grid">
      {/* Dynamic ambient drifting tech lights */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/10 -top-40 -left-40 blur-[120px] animate-drift-1"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-accent-cyan/10 -bottom-40 -right-40 blur-[120px] animate-drift-2"></div>
      
      {/* Decorative center tech glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent-violet/5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-[80px]"></div>

      <div className="w-full max-w-md bg-[#0F1626]/80 border border-dark-border/80 rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10 hover:border-primary/30 transition-all duration-300">
        
        {/* Futuristic Top Grid Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4 group">
            {/* outer glowing ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent-cyan to-accent-violet blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-[#090D1A] border border-dark-border flex items-center justify-center text-accent-cyan shadow-xl group-hover:scale-105 transition-transform duration-300">
              <BrainCircuit className="w-9 h-9 text-accent-cyan" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-dark-muted bg-clip-text text-transparent tracking-wide text-center">
            Register Operator
          </h2>
          <p className="text-xs text-dark-muted mt-2 tracking-widest uppercase font-semibold">
            Join the SmartMFG System Network
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-muted tracking-wider mb-1.5">Username</label>
            <div className="relative glow-card-border rounded-lg border border-dark-border transition-all">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent rounded-lg pl-10 pr-4 py-2.5 text-xs text-dark-text focus:outline-none placeholder:text-dark-muted"
                placeholder="e.g. tech_dave"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-muted tracking-wider mb-1.5">Email Address</label>
            <div className="relative glow-card-border rounded-lg border border-dark-border transition-all">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent rounded-lg pl-10 pr-4 py-2.5 text-xs text-dark-text focus:outline-none placeholder:text-dark-muted"
                placeholder="e.g. dave@smartmfg.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-muted tracking-wider mb-1.5">Sector Role</label>
            <div className="relative glow-card-border rounded-lg border border-dark-border transition-all">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <UserCheck className="w-4 h-4" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0E1424] rounded-lg pl-10 pr-4 py-2.5 text-xs text-dark-text focus:outline-none cursor-pointer"
              >
                <option value="ROLE_OPERATOR">Operator (General)</option>
                <option value="ROLE_MAINTENANCE_ENGINEER">Maintenance Engineer</option>
                <option value="ROLE_PRODUCTION_MANAGER">Production Manager</option>
                <option value="ROLE_INVENTORY_MANAGER">Inventory Specialist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-muted tracking-wider mb-1.5">Password</label>
            <div className="relative glow-card-border rounded-lg border border-dark-border transition-all">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent rounded-lg pl-10 pr-4 py-2.5 text-xs text-dark-text focus:outline-none placeholder:text-dark-muted"
                placeholder="Minimum 6 characters..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent-violet hover:from-primary/90 hover:to-accent-violet/90 font-bold text-white transition-all duration-200 shadow-lg glow-cyan disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider mt-2"
          >
            {submitting ? 'Registering Operator Credentials...' : 'Create Operator Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-dark-muted">
          Already registered?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-bold transition-all">
            Secure Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
