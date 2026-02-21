import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Car, Eye, EyeOff, Shield, Star, Zap, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { customToast } from '../components/CustomToast';
import { useConfetti } from '../hooks/useConfetti';

/* ── Shared side panel for split-screen auth layout ── */
function AuthSidePanel({ mode }: { mode: 'login' | 'signup' }) {
  return (
    <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-dark-800 items-center justify-center p-12">
      {/* Blurred color blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary-500/[0.08] blur-[100px] animate-aurora" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-neon-blue/[0.06] blur-[100px] animate-aurora-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/[0.04] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.02] rounded-full" />

      <div className="relative z-10 max-w-sm text-center">
        {/* Logo */}
        <ScrollReveal direction="left" delay={0}>
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Car className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-3xl font-display font-extrabold text-white tracking-tight">
            Drive<span className="text-primary-400">X</span>
          </span>
        </div>
        </ScrollReveal>

        <ScrollReveal direction="left" delay={100}>
        <h2 className="text-white !text-2xl mb-4">
          {mode === 'login' ? 'Welcome back to the road.' : 'Join 10,000+ riders.'}
        </h2>
        <p className="text-dark-300 text-sm leading-relaxed mb-10">
          {mode === 'login'
            ? 'Sign in to access your bookings, manage vehicles, and get back on the road.'
            : 'Create your account and start renting premium vehicles in under 2 minutes.'}
        </p>
        </ScrollReveal>

        {/* Feature pills */}
        <ScrollReveal direction="left" delay={200}>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: Shield, text: 'Fully insured' },
            { icon: Star, text: '4.8★ rated' },
            { icon: Zap, text: 'Instant booking' },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70"
            >
              <Icon className="w-3.5 h-3.5 text-primary-400" /> {text}
            </span>
          ))}
        </div>
        </ScrollReveal>

        {/* Testimonial */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
          <p className="text-sm text-white/80 leading-relaxed mb-4">
            "DriveX made renting premium cars effortless. Found a BMW within 5 minutes!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
              AM
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Arjun Mehta</p>
              <p className="text-[10px] text-dark-400">Frequent traveler</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      customToast.celebration('Welcome back!');
      const role = useAuthStore.getState().user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'owner') navigate('/owner/dashboard');
      else navigate('/user/dashboard');
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AuthSidePanel mode="login" />

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-dark-950">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo (hidden on lg) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-display font-extrabold text-white">
                Drive<span className="text-gradient">X</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="!text-3xl text-white">Sign in</h1>
            <p className="text-dark-400 text-sm mt-2">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo accounts — subtle accordion */}
            <details className="group">
              <summary className="text-xs text-dark-400 font-medium cursor-pointer hover:text-dark-600 transition-colors flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-accent-500 mr-1" />
                Demo accounts available
              </summary>
              <div className="mt-2 p-3 rounded-xl bg-dark-800/60 border border-white/[0.06] text-[11px] text-dark-400 space-y-1 font-mono animate-fade-in">
                <p><span className="text-dark-300 font-sans font-medium">Admin:</span> admin@carrental.com / admin123</p>
                <p><span className="text-dark-300 font-sans font-medium">Owner:</span> owner1@carrental.com / owner123</p>
                <p><span className="text-dark-300 font-sans font-medium">User:</span> user1@carrental.com / user123</p>
              </div>
            </details>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !rounded-xl"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-8">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary-400 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const { stars } = useConfetti();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password, role);
      customToast.celebration('Account created!');
      stars();
      navigate(role === 'owner' ? '/owner/dashboard' : '/user/dashboard');
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AuthSidePanel mode="signup" />

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-dark-950">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-display font-extrabold text-white">
                Drive<span className="text-gradient">X</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="!text-3xl text-white">Create account</h1>
            <p className="text-dark-400 text-sm mt-2">Start your journey with DriveX</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                required
                minLength={2}
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="label">Email address</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              <div className="flex gap-1 mt-2">
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      password.length >= i * 2
                        ? password.length >= 8
                          ? 'bg-accent-500'
                          : password.length >= 6
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                        : 'bg-dark-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user', label: '🚗 Rent a car', desc: 'Find & book vehicles' },
                  { value: 'owner', label: '💰 List my car', desc: 'Earn from your vehicle' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                      role === value
                        ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                        : 'border-white/[0.08] bg-dark-800/50 hover:border-white/[0.15]'
                    }`}
                  >
                    <p className="font-bold text-white text-sm">{label}</p>
                    <p className="text-[11px] text-dark-400 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !rounded-xl"
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-8">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
