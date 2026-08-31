import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, AlertCircle, ArrowRight, Sparkles, User, Briefcase, Shield } from 'lucide-react';

const Login = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (data.user.role === 'customer') navigate('/dashboard');
      else if (data.user.role === 'provider') navigate('/provider-dashboard');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      const data = await quickDemoLogin(role);
      if (data.user.role === 'customer') navigate('/dashboard');
      else if (data.user.role === 'provider') navigate('/provider-dashboard');
      else if (data.user.role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-600/20">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to Ustaad<span className="text-brand-600">.pk</span>
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage your appointments, jobs, or admin desk.
          </p>
        </div>

        {/* 1-Click Demo Accounts Selector */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>1-Click Test Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-2 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all"
            >
              <User className="w-3.5 h-3.5 text-brand-600" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('provider')}
              className="py-2 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              <span>Provider</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign in to Ustaad.pk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
