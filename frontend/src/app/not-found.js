'use client';

import Link from 'next/link';
import { Activity, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(0,212,170,0.08)',
          border: '1px solid rgba(0,212,170,0.2)',
          borderRadius: '50%',
          width: '5rem',
          height: '5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--color-teal-400)',
        }}
      >
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: '0.5rem',
        }}
        className="gradient-text-teal"
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '0.75rem',
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
          maxWidth: '400px',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Check the URL or navigate back to the dashboard.
      </p>

      <div className="flex gap-3">
        <Link href="/">
          <button className="btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
            <Activity className="h-4 w-4" />
            Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
