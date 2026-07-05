import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err || 'Failed to authenticate. Check credentials.');
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
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            {/* outer glowing ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent-cyan to-accent-violet blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-[#090D1A] border border-dark-border flex items-center justify-center text-accent-cyan shadow-xl group-hover:scale-105 transition-transform duration-300">
              <BrainCircuit className="w-9 h-9 text-accent-cyan" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-dark-muted bg-clip-text text-transparent tracking-wide text-center">
            Welcome to SmartMFG
          </h2>
          <p className="text-xs text-dark-muted mt-2 tracking-widest uppercase font-semibold">
            Autonomous Manufacturing AI Console
          </p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials hints for easy login */}
        <div className="mb-6 p-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-[11px] text-dark-muted space-y-1">
          <div className="font-bold uppercase tracking-wider text-dark-text mb-1">Developer Demo Access:</div>
          <div>Admin: <strong className="text-accent-cyan">admin@smartmfg.com</strong> / <strong className="text-accent-cyan">Password123</strong></div>
          <div>Engineer: <strong className="text-accent-cyan">engineer@smartmfg.com</strong> / <strong className="text-accent-cyan">Password123</strong></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-muted tracking-wider mb-2">Username or Email</label>
            <div className="relative glow-card-border rounded-lg border border-dark-border transition-all">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent rounded-lg pl-10 pr-4 py-3 text-xs text-dark-text focus:outline-none placeholder:text-dark-muted"
                placeholder="Enter admin@smartmfg.com..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-dark-muted tracking-wider mb-2">Password</label>
            <div className="relative glow-card-border rounded-lg border border-dark-border transition-all">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent rounded-lg pl-10 pr-4 py-3 text-xs text-dark-text focus:outline-none placeholder:text-dark-muted"
                placeholder="Enter Password123..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent-violet hover:from-primary/90 hover:to-accent-violet/90 font-bold text-white transition-all duration-200 shadow-lg glow-cyan disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
          >
            {submitting ? 'Connecting Secure Gateway...' : 'Initiate Secure Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-dark-muted">
          Need access credentials?{' '}
          <Link to="/register" className="text-accent-cyan hover:underline font-bold transition-all">
            Register Operator Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
