'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Activity, LayoutDashboard, MonitorPlay, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ROLE_CONFIG = {
  ADMIN: { label: 'Admin', color: 'var(--color-teal-400)', bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.2)' },
  RECEPTIONIST: { label: 'Reception', color: 'var(--color-violet-400)', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
  DOCTOR: { label: 'Doctor', color: 'var(--color-amber-400)', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
};

function UserAvatar({ name, role }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.RECEPTIONIST;

  return (
    <div
      style={{
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 800,
        color: cfg.color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.RECEPTIONIST;

  return (
    <nav
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        padding: '0 1.5rem',
        height: '3.5rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Branding */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-teal-400))',
              borderRadius: '8px',
              padding: '5px',
              display: 'flex',
            }}
          >
            <Activity className="h-4 w-4" style={{ color: '#080E1A' }} />
          </div>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
            className="gradient-text-teal"
          >
            HAQMS
          </span>
        </Link>

        {/* Center Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div
              className="sidebar-link"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </div>
          </Link>
          <Link href="/queue" style={{ textDecoration: 'none' }}>
            <div
              className="sidebar-link"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
            >
              <MonitorPlay className="h-4 w-4" />
              Live Queue
            </div>
          </Link>
        </div>

        {/* Right: User menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.375rem 0.625rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.border; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <UserAvatar name={user.name} role={user.role} />
            <div
              className="hidden sm:flex flex-col items-start"
              style={{ lineHeight: 1.2 }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {user.name}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: cfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Shield className="h-2.5 w-2.5" />
                {cfg.label}
              </span>
            </div>
            <ChevronDown
              className="h-3 w-3"
              style={{
                color: 'var(--color-text-muted)',
                transition: 'transform 0.2s ease',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="glass animate-fade-in"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '200px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem', wordBreak: 'break-all' }}>
                  {user.email}
                </p>
              </div>

              <div style={{ padding: '0.375rem' }}>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-rose-400)',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
