'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Administrator', email: 'admin@haqms.com', color: 'var(--color-teal-400)', dot: 'var(--color-teal-500)' },
  { role: 'Receptionist', email: 'reception1@haqms.com', color: 'var(--color-violet-400)', dot: '#8B5CF6' },
  { role: 'Doctor', email: 'doctor1@haqms.com', color: 'var(--color-amber-400)', dot: 'var(--color-amber-500)' },
];

export default function Login() {
  const { login, error: authError, loading, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (clearError) clearError();

    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    const result = await login(email.trim().toLowerCase(), password);
    if (!result.success) {
      setValidationError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const fillDemo = (acc) => {
    setValidationError('');
    if (clearError) clearError();
    setEmail(acc.email);
    setPassword('password123');
  };

  const displayError = validationError || authError;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* ─── Left Panel (branding) ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{
          width: '40%',
          flexShrink: 0,
          background: 'linear-gradient(160deg, rgba(0,180,148,0.15) 0%, rgba(8,14,26,0.95) 40%, rgba(124,58,237,0.08) 100%)',
          borderRight: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-teal-400))',
                borderRadius: '12px',
                padding: '10px',
                display: 'flex',
              }}
            >
              <Activity className="h-6 w-6" style={{ color: '#080E1A' }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              <span className="gradient-text-teal">HAQMS</span>
            </span>
          </div>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative' }}>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Hospital management
            <br />
            <span className="gradient-text-teal">made simple.</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '320px' }}>
            Appointments, patient records, and real-time queue management — all in one secure platform.
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '2rem',
            }}
          >
            {[
              { val: '3 Roles', label: 'Access Levels' },
              { val: 'Real-time', label: 'Queue Updates' },
              { val: 'Secure', label: 'JWT Auth' },
              { val: 'Atomic', label: 'Transactions' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(0,212,170,0.05)',
                  border: '1px solid rgba(0,212,170,0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-teal-400)' }}>
                  {s.val}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', position: 'relative' }}>
          v2.0.0 — All data is for demonstration purposes.
        </p>
      </div>

      {/* ─── Right Panel (form) ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div
            style={{
              background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-teal-400))',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
            }}
          >
            <Activity className="h-5 w-5" style={{ color: '#080E1A' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>
            <span className="gradient-text-teal">HAQMS</span>
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem' }}>{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  className="h-4 w-4"
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.com"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  className="h-4 w-4"
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: 0,
                    display: 'flex',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#080E1A',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.875rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                Demo Accounts
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.625rem 0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,170,0.25)';
                    e.currentTarget.style.background = 'var(--color-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: acc.dot,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: acc.color }}>
                        {acc.role}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <Link href="/" style={{ color: 'var(--color-teal-500)', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
