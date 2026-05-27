'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/common/Navbar';
import {
  Activity, Bell, Monitor, RefreshCw, AlertCircle,
  Clock, Users, CheckCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function StatusDot({ active }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: active ? 'var(--color-teal-400)' : 'var(--color-text-muted)',
        boxShadow: active ? '0 0 0 3px rgba(0,212,170,0.2)' : 'none',
        animation: active ? 'pulse 2s ease-in-out infinite' : 'none',
      }}
    />
  );
}

function DoctorQueueCard({ docId, docInfo }) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.25s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Doctor Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(0,212,170,0.03)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal-400)',
              flexShrink: 0,
              fontSize: '1rem',
              fontWeight: 800,
            }}
          >
            {docInfo.doctorName?.charAt(0) || 'D'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: 'var(--color-text-primary)',
                marginBottom: '0.15rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {docInfo.doctorName}
            </h3>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--color-teal-500)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {docInfo.specialization}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot active={!!docInfo.calling} />
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {docInfo.calling ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Token Display */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Now Calling */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.75rem',
            }}
          >
            <Volume2Icon />
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Now Calling
            </span>
          </div>

          {docInfo.calling ? (
            <div
              className="token-calling"
              style={{ padding: '1.5rem', textAlign: 'center' }}
            >
              <div
                className="token-calling-number"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  color: 'var(--color-teal-400)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  marginBottom: '0.5rem',
                }}
              >
                #{docInfo.calling.tokenNumber.toString().padStart(3, '0')}
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                }}
              >
                {docInfo.calling.patient?.name || 'Patient'}
              </p>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(8,14,26,0.6)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  letterSpacing: '0.05em',
                }}
              >
                — —
              </span>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.375rem',
                }}
              >
                No patient being called
              </p>
            </div>
          )}
        </div>

        {/* Queue list */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.625rem',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Queue
            </span>
            {docInfo.waiting.length > 0 && (
              <span
                className="badge badge-slate"
                style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}
              >
                {docInfo.waiting.length} waiting
              </span>
            )}
          </div>

          {docInfo.waiting.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {docInfo.waiting.map((token, idx) => (
                <div
                  key={token.id}
                  title={`Token #${token.tokenNumber} — ${token.patient?.name || 'Patient'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.625rem',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,170,0.25)';
                    e.currentTarget.style.color = 'var(--color-teal-400)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>#</span>
                  {token.tokenNumber.toString().padStart(3, '0')}
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
              }}
            >
              No patients in queue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Volume2Icon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ color: 'var(--color-teal-500)' }}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export default function QueueMonitor() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchQueueData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/queue`);
      if (!res.ok) throw new Error('Failed to retrieve active token queue.');
      const data = await res.json();
      setTokens(data.data || data);
      setError('');
      setLastUpdated(new Date());
      setRefreshCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchQueueData();

    // FIX: Memory leak fixed — interval is properly cleaned up on unmount
    intervalRef.current = setInterval(fetchQueueData, 5000);

    return () => {
      // This runs when the component unmounts — clears the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchQueueData]);

  // Group tokens by doctor
  const groupedTokens = tokens.reduce((groups, token) => {
    if (!token.doctor) return groups;
    const docId = token.doctorId;
    if (!groups[docId]) {
      groups[docId] = {
        doctorName: token.doctor.name,
        specialization: token.doctor.specialization,
        calling: null,
        waiting: [],
      };
    }

    if (token.status === 'CALLING') {
      groups[docId].calling = token;
    } else if (token.status === 'WAITING') {
      groups[docId].waiting.push(token);
    }
    return groups;
  }, {});

  const activeDoctors = Object.keys(groupedTokens).length;
  const totalWaiting = tokens.filter((t) => t.status === 'WAITING').length;
  const totalCalling = tokens.filter((t) => t.status === 'CALLING').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <div
          className="glass"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              style={{
                background: 'rgba(0,212,170,0.1)',
                border: '1px solid rgba(0,212,170,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--color-teal-400)',
              }}
            >
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Live Queue Monitor
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                Public real-time physician calling board
                {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            {[
              { icon: <Users className="h-3.5 w-3.5" />, val: totalWaiting, label: 'Waiting', color: 'var(--color-violet-400)' },
              { icon: <Activity className="h-3.5 w-3.5" />, val: totalCalling, label: 'Calling', color: 'var(--color-teal-400)' },
              { icon: <Clock className="h-3.5 w-3.5" />, val: activeDoctors, label: 'Doctors', color: 'var(--color-amber-400)' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.875rem',
                  minWidth: '60px',
                }}
              >
                <div style={{ color: s.color, marginBottom: '0.1rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  {s.val}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
              </div>
            ))}

            {/* Auto-refresh indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: 'rgba(0,212,170,0.08)',
                border: '1px solid rgba(0,212,170,0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '0.375rem 0.75rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--color-teal-400)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <RefreshCw className="h-3 w-3 animate-spin" />
              Live
            </div>
          </div>
        </div>

        {/* ─── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div>
              <strong>Connection Error:</strong> {error} — Verify the backend server is online.
            </div>
          </div>
        )}

        {/* ─── Loading ────────────────────────────────────────────────────── */}
        {loading && tokens.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '5rem',
              paddingBottom: '5rem',
              gap: '1rem',
            }}
          >
            <div className="pulse-loader">
              <div />
              <div />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Loading queue data...
            </p>
          </div>
        ) : Object.keys(groupedTokens).length === 0 ? (
          /* ─── Empty State ──────────────────────────────────────────────── */
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderStyle: 'dashed',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <Bell className="h-7 w-7" />
            </div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Queue is Empty
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                maxWidth: '400px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              No active patient check-ins at this time. Use the Receptionist portal in the Staff Dashboard
              to check in patients and generate queue tokens.
            </p>
          </div>
        ) : (
          /* ─── Doctor Queue Grid ─────────────────────────────────────────── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {Object.entries(groupedTokens).map(([docId, docInfo]) => (
              <DoctorQueueCard key={docId} docId={docId} docInfo={docInfo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
