'use client';

import Link from 'next/link';
import {
  Activity, Users, MonitorPlay, ArrowRight, ShieldCheck,
  Zap, Database, Clock, HeartPulse, Stethoscope, Calendar
} from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Secure by Design',
    desc: 'JWT authentication, role-based access control, and parameterized database queries.',
    color: 'teal',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'High Performance',
    desc: 'Concurrent database queries, efficient pagination, and optimized N+1-free data fetching.',
    color: 'violet',
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: 'Reliable Data',
    desc: 'Atomic transactions prevent duplicate tokens, with DB-level constraints enforcing data integrity.',
    color: 'amber',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'Real-Time Queue',
    desc: 'Live patient queue board with auto-refresh and physician calling status at a glance.',
    color: 'emerald',
  },
];

const roles = [
  {
    icon: <HeartPulse className="h-6 w-6" />,
    role: 'Administrator',
    desc: 'Full system reports, physician registry, and audit capabilities.',
    color: '#00D4AA',
  },
  {
    icon: <Users className="h-6 w-6" />,
    role: 'Receptionist',
    desc: 'Register patients, book appointments, and manage walk-in check-ins.',
    color: '#8B5CF6',
  },
  {
    icon: <Stethoscope className="h-6 w-6" />,
    role: 'Doctor',
    desc: 'View daily worklist, manage queue tokens, and access patient histories.',
    color: '#F59E0B',
  },
];

const colorMap = {
  teal: { bg: 'rgba(0,212,170,0.07)', border: 'rgba(0,212,170,0.15)', text: 'var(--color-teal-400)' },
  violet: { bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.15)', text: 'var(--color-violet-400)' },
  amber: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.15)', text: 'var(--color-amber-400)' },
  emerald: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.15)', text: 'var(--color-emerald-400)' },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 glass border-b px-6 py-4" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-teal-400))',
                borderRadius: '10px',
                padding: '6px',
                display: 'flex',
              }}
            >
              <Activity className="h-5 w-5" style={{ color: '#020507' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              <span className="gradient-text-teal">HAQMS</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/queue">
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                <MonitorPlay className="h-4 w-4" />
                Live Queue
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* ─── Hero ────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 mb-8"
            style={{
              background: 'rgba(0,212,170,0.07)',
              border: '1px solid rgba(0,212,170,0.15)',
              borderRadius: '100px',
              padding: '0.375rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-teal-400)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--color-teal-400)',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            System Online · Real-time Queue Active
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
            }}
          >
            <span className="gradient-text-teal">Hospital Management</span>
            <br />
            <span style={{ color: 'var(--color-text-primary)' }}>Reimagined.</span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
            }}
          >
            Streamline patient appointments, real-time queue management, and physician workflows
            with a secure, role-based platform built for modern healthcare.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <button className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}>
                <Users className="h-4 w-4" />
                Staff Portal
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/queue">
              <button className="btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}>
                <MonitorPlay className="h-4 w-4" />
                Live Queue Monitor
              </button>
            </Link>
          </div>
        </section>

        {/* ─── Feature Cards ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {features.map((f) => {
              const c = colorMap[f.color];
              return (
                <div
                  key={f.title}
                  className="card animate-fade-in-up"
                  style={{ transition: 'all 0.25s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.border;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '10px',
                      padding: '8px',
                      width: 'fit-content',
                      color: c.text,
                      marginBottom: '1rem',
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Role Overview ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div
            className="glass"
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(6,12,18,0.95), rgba(10,18,25,0.95))',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Role-Based Access
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Three distinct workflows for every member of your team
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {roles.map((r) => (
                <div
                  key={r.role}
                  style={{
                    background: 'rgba(2,5,7,0.6)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: `${r.color}12`,
                      border: `1px solid ${r.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      color: r.color,
                    }}
                  >
                    {r.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                    {r.role}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Access CTA — assessment environment notice removed */}
            <div
              style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Link href="/login">
                <button className="btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                  <Calendar className="h-4 w-4" />
                  Access Dashboard
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="glass border-t"
        style={{
          borderColor: 'var(--color-border)',
          padding: '1.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          HAQMS v2.0.0 &copy; {new Date().getFullYear()} — Hospital Appointment & Queue Management System
        </p>
      </footer>
    </div>
  );
}
