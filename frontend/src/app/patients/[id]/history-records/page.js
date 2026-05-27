'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Heart, Phone, Mail, Calendar, User, Activity,
  Clock, FileText, CheckCircle, XCircle, AlertCircle, Stethoscope
} from 'lucide-react';

function getStatusBadge(status) {
  const map = {
    COMPLETED: { cls: 'badge badge-emerald', icon: <CheckCircle className="h-3 w-3" /> },
    CANCELLED: { cls: 'badge badge-rose', icon: <XCircle className="h-3 w-3" /> },
    PENDING: { cls: 'badge badge-amber', icon: <Clock className="h-3 w-3" /> },
    CONFIRMED: { cls: 'badge badge-teal', icon: <CheckCircle className="h-3 w-3" /> },
  };
  return map[status] || { cls: 'badge badge-slate', icon: null };
}

function SkeletonRow() {
  return (
    <tr>
      <td colSpan={5} style={{ padding: '0.875rem 1rem' }}>
        <div className="skeleton" style={{ height: '1rem', width: '100%' }} />
      </td>
    </tr>
  );
}

export default function PatientHistoryPage() {
  const { user, token, API_BASE_URL } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auth guard
  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  // Fetch patient with appointments
  useEffect(() => {
    if (!token || !patientId) return;

    const fetchPatient = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Patient record not found.');
          } else {
            setError('Failed to load patient data.');
          }
          return;
        }

        const data = await res.json();
        setPatient(data.data || data);
      } catch (err) {
        setError(err.message || 'Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [token, patientId, API_BASE_URL]);

  if (!user) return null;

  const appointments = patient?.appointments || [];
  const totalCompleted = appointments.filter((a) => a.status === 'COMPLETED').length;
  const totalCancelled = appointments.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {/* ─── Back Navigation ─────────────────────────────────────────────── */}
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button
            className="btn-secondary"
            style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </Link>

        {/* ─── Error State ──────────────────────────────────────────────────── */}
        {error && (
          <div className="alert alert-error animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* ─── Loading State ────────────────────────────────────────────────── */}
        {loading && !error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '4rem',
              gap: '1rem',
            }}
          >
            <div className="pulse-loader">
              <div />
              <div />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Loading patient records...
            </p>
          </div>
        )}

        {/* ─── Patient Profile & History ────────────────────────────────────── */}
        {!loading && !error && patient && (
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Patient Header Card */}
            <div
              className="glass"
              style={{
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(0,180,148,0.08), rgba(13,21,38,0.95), rgba(124,58,237,0.04))',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,180,148,0.05))',
                    border: '2px solid rgba(0,212,170,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: 'var(--color-teal-400)',
                    flexShrink: 0,
                  }}
                >
                  {patient.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h1
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {patient.name}
                    </h1>
                    <span className="badge badge-teal">
                      {patient.gender}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {patient.age} years old
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {patient.phoneNumber}
                    </span>
                    {patient.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {patient.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Registered {new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { label: 'Total Visits', value: appointments.length, color: 'var(--color-teal-400)' },
                    { label: 'Completed', value: totalCompleted, color: 'var(--color-emerald-400)' },
                    { label: 'Cancelled', value: totalCancelled, color: 'var(--color-rose-400)' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        textAlign: 'center',
                        background: 'rgba(8,14,26,0.5)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        minWidth: '70px',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <Heart className="h-5 w-5" style={{ color: 'var(--color-rose-400)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Medical History & Conditions
                </h2>
              </div>

              <div
                style={{
                  background: 'rgba(8,14,26,0.5)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                {/* FIX: Safe rendering with optional chaining — no crash on null */}
                {patient.medicalHistory ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                    {patient.medicalHistory}
                  </p>
                ) : (
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <FileText className="h-4 w-4" />
                    <span style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
                      No medical history on record for this patient.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment History */}
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <Activity className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Appointment & Consultation History
                </h2>
                {appointments.length > 0 && (
                  <span className="badge badge-teal" style={{ marginLeft: 'auto' }}>
                    {appointments.length} records
                  </span>
                )}
              </div>

              {appointments.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <Calendar className="h-10 w-10" style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    No appointment history found for this patient.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Physician</th>
                        <th>Department</th>
                        <th>Reason</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => {
                        const badge = getStatusBadge(appt.status);
                        return (
                          <tr key={appt.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric',
                                })}
                              </div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td>
                              {appt.doctor ? (
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
                                    {appt.doctor.name}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--color-teal-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {appt.doctor.specialization}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Unknown</span>
                              )}
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>
                              {appt.doctor?.department || '—'}
                            </td>
                            <td
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-text-secondary)',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={appt.reason || 'No reason provided'}
                            >
                              {appt.reason || <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>—</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={badge.cls} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                {badge.icon}
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
