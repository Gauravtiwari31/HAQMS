'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, CalendarDays, Activity, Search, UserPlus,
  Trash2, ClipboardList, TrendingUp, DollarSign, Award, Clock,
  ArrowRight, CheckCircle, Volume2, BarChart3, Stethoscope,
  RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight,
  Phone, Mail, Heart
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadgeClass(status) {
  switch (status) {
    case 'COMPLETED': return 'badge badge-emerald';
    case 'CANCELLED': return 'badge badge-rose';
    case 'CALLING': return 'badge badge-teal';
    case 'PENDING': return 'badge badge-amber';
    case 'WAITING': return 'badge badge-violet';
    case 'SKIPPED': return 'badge badge-slate';
    default: return 'badge badge-slate';
  }
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Toast notification
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: 'var(--color-emerald-400)' },
    error: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)', text: 'var(--color-rose-400)' },
    info: { bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.25)', text: 'var(--color-teal-400)' },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '0.875rem 1rem',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '360px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ color: c.text, fontSize: '0.875rem', fontWeight: 600, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, display: 'flex' }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Stat Card
function StatCard({ icon, label, value, sublabel, color = 'teal' }) {
  const colors = {
    teal: { bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.15)', text: 'var(--color-teal-400)', gradient: 'linear-gradient(90deg, var(--color-teal-500), var(--color-teal-400))' },
    violet: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)', text: 'var(--color-violet-400)', gradient: 'linear-gradient(90deg, #7C3AED, var(--color-violet-400))' },
    amber: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', text: 'var(--color-amber-400)', gradient: 'linear-gradient(90deg, var(--color-amber-500), var(--color-amber-400))' },
    rose: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.15)', text: 'var(--color-rose-400)', gradient: 'linear-gradient(90deg, #E11D48, var(--color-rose-400))' },
  };
  const c = colors[color] || colors.teal;

  return (
    <div
      className="stat-card"
      style={{ '--gradient': c.gradient }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            {label}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {value}
          </p>
          {sublabel && (
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              {sublabel}
            </p>
          )}
        </div>
        <div
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.625rem',
            color: c.text,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, token, API_BASE_URL, logout } = useAuth();
  const router = useRouter();

  // Navigation Guard
  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const defaultTab = user.role === 'ADMIN' ? 'reports' : user.role === 'RECEPTIONIST' ? 'patients' : 'appointments';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // ─── Toast ───────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ─── Patient State ───────────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientGender, setPatientGender] = useState('All');
  const [patientsPagination, setPatientsPagination] = useState({ page: 1, totalPages: 1, totalPatients: 0 });

  // FIX: Debounce search — only fires API call after 300ms of no typing
  const debouncedSearch = useDebounce(patientSearch, 300);

  // Registration form
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', age: '', gender: 'Male', history: '' });
  const [regLoading, setRegLoading] = useState(false);

  // Booking form
  const [bookForm, setBookForm] = useState({ patientId: '', doctorId: '', date: '', reason: '' });
  const [bookLoading, setBookLoading] = useState(false);

  // Walkin
  const [walkinForm, setWalkinForm] = useState({ patientId: '', doctorId: '' });
  const [walkinLoading, setWalkinLoading] = useState(false);

  // ─── Doctor State ─────────────────────────────────────────────────────────
  const [doctorsList, setDoctorsList] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ─── Admin State ──────────────────────────────────────────────────────────
  const [adminReport, setAdminReport] = useState(null);
  const [adminReportLoading, setAdminReportLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [summary, setSummary] = useState(null);

  // ─── Fetch patients (with debounced search) ───────────────────────────────
  const fetchPatients = useCallback(async (page = 1) => {
    if (!token) return;
    setPatientsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 8,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(patientGender !== 'All' && { gender: patientGender }),
      });
      const res = await fetch(`${API_BASE_URL}/patients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.data.patients);
        setPatientsPagination(data.data.pagination);
      }
    } catch (e) {
      console.error('[PATIENTS FETCH]', e);
    } finally {
      setPatientsLoading(false);
    }
  }, [token, API_BASE_URL, debouncedSearch, patientGender]);

  // FIX: Only re-fetch when debouncedSearch (not raw search) or gender changes
  useEffect(() => {
    if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
      fetchPatients(1);
    }
  }, [debouncedSearch, patientGender, fetchPatients, user.role]);

  // Fetch doctors
  const fetchDoctors = useCallback(async (search = '') => {
    if (!token) return;
    try {
      const params = new URLSearchParams(search ? { search } : {});
      const res = await fetch(`${API_BASE_URL}/doctors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDoctorsList(data.data);
    } catch (e) {
      console.error('[DOCTORS FETCH]', e);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    if (token) fetchDoctors();
  }, [token, fetchDoctors]);

  // ─── Fetch summary stats ──────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch (e) {
      console.error('[SUMMARY FETCH]', e);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    if (token) fetchSummary();
  }, [token, fetchSummary]);

  // ─── Register patient ─────────────────────────────────────────────────────
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.phone || !regForm.age) {
      showToast('Name, phone, and age are required.', 'error');
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: regForm.name,
          email: regForm.email || undefined,
          phoneNumber: regForm.phone,
          age: regForm.age,
          gender: regForm.gender,
          medicalHistory: regForm.history || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Patient "${regForm.name}" registered successfully!`, 'success');
        setRegForm({ name: '', email: '', phone: '', age: '', gender: 'Male', history: '' });
        fetchPatients(1);
        fetchSummary();
      } else {
        showToast(data.error || 'Failed to register patient.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRegLoading(false);
    }
  };

  // ─── Book appointment ─────────────────────────────────────────────────────
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookForm.patientId || !bookForm.doctorId || !bookForm.date) {
      showToast('Please fill in all required booking fields.', 'error');
      return;
    }
    setBookLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: bookForm.patientId,
          doctorId: bookForm.doctorId,
          appointmentDate: bookForm.date,
          reason: bookForm.reason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Appointment booked successfully!', 'success');
        setBookForm({ patientId: '', doctorId: '', date: '', reason: '' });
      } else {
        showToast(data.error || 'Failed to book appointment.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBookLoading(false);
    }
  };

  // ─── Delete patient ───────────────────────────────────────────────────────
  const handleDeletePatient = async (id, name) => {
    if (!confirm(`Delete patient record for "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Patient deleted.', 'success');
        fetchPatients(patientsPagination.page);
        fetchSummary();
      } else {
        showToast(data.error || 'Failed to delete patient.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─── Queue check-in ───────────────────────────────────────────────────────
  const handleQueueCheckin = async (patientId, doctorId, appointmentId = null) => {
    setWalkinLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/queue/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId, doctorId, appointmentId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Token #${data.data?.tokenNumber} assigned!`, 'success');
        if (user.role === 'DOCTOR') fetchDoctorWorklist();
      } else {
        showToast(data.error || 'Check-in failed.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setWalkinLoading(false);
    }
  };

  // ─── Doctor worklist ──────────────────────────────────────────────────────
  const fetchDoctorWorklist = useCallback(async () => {
    if (user.role !== 'DOCTOR' || !token || doctorsList.length === 0) return;
    try {
      const matchedDoc = doctorsList.find((d) => d.userId === user.id);
      if (!matchedDoc) return;

      const [appRes, queueRes] = await Promise.all([
        fetch(`${API_BASE_URL}/appointments?doctorId=${matchedDoc.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/queue?doctorId=${matchedDoc.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [appData, queueData] = await Promise.all([appRes.json(), queueRes.json()]);
      if (appData.success) setDoctorAppointments(appData.data);
      if (queueData.success) setDoctorQueue(queueData.data || []);
    } catch (e) {
      console.error('[DOCTOR WORKLIST]', e);
    }
  }, [user.role, user.id, token, API_BASE_URL, doctorsList]);

  useEffect(() => {
    if (user.role === 'DOCTOR' && doctorsList.length > 0) {
      fetchDoctorWorklist();
    }
  }, [doctorsList, fetchDoctorWorklist, user.role]);

  // ─── Update queue token ───────────────────────────────────────────────────
  const handleUpdateQueueStatus = async (tokenId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/${tokenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Status updated to ${newStatus}.`, 'success');
        fetchDoctorWorklist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Complete appointment ─────────────────────────────────────────────────
  const handleCompleteAppointment = async (appId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok) {
        showToast('Appointment marked as completed.', 'success');
        fetchDoctorWorklist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Admin report ─────────────────────────────────────────────────────────
  const generateSystemReport = async () => {
    setAdminReportLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reports/doctor-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAdminReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAdminReportLoading(false);
    }
  };

  // ─── Tab Config ───────────────────────────────────────────────────────────
  const tabs = [];
  if (user.role === 'ADMIN') {
    tabs.push({ id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> });
    tabs.push({ id: 'physicians', label: 'Physicians', icon: <Stethoscope className="h-4 w-4" /> });
  }
  if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
    tabs.push({ id: 'patients', label: 'Patients', icon: <Users className="h-4 w-4" /> });
    tabs.push({ id: 'book', label: 'Scheduling', icon: <CalendarDays className="h-4 w-4" /> });
  }
  if (user.role === 'DOCTOR') {
    tabs.push({ id: 'appointments', label: 'Appointments', icon: <CalendarDays className="h-4 w-4" /> });
    tabs.push({ id: 'queue', label: 'Queue', icon: <Activity className="h-4 w-4" /> });
  }

  // ─── Summary stats for header ─────────────────────────────────────────────
  const summaryStats = summary
    ? [
        { label: 'Total Patients', value: summary.totalPatients, icon: <Users className="h-4 w-4" />, color: 'teal' },
        { label: 'Total Doctors', value: summary.totalDoctors, icon: <Stethoscope className="h-4 w-4" />, color: 'violet' },
        { label: "Today's Appts", value: summary.todayAppointments, icon: <CalendarDays className="h-4 w-4" />, color: 'amber' },
        { label: 'Queue Today', value: summary.todayQueueTokens, icon: <Activity className="h-4 w-4" />, color: 'rose' },
      ]
    : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem',
        }}
      >
        {/* ─── Welcome Banner ──────────────────────────────────────────────── */}
        <div
          className="glass"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(0,180,148,0.08), rgba(13,21,38,0.9), rgba(124,58,237,0.05))',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.25rem',
                }}
              >
                Good{' '}
                {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                <span className="gradient-text-teal">{user.name.split(' ')[0]}</span>
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Summary stats */}
            {summaryStats.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {summaryStats.map((s) => (
                  <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Tab Navigation ──────────────────────────────────────────────── */}
        <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== PATIENTS TAB ===== */}
        {activeTab === 'patients' && (
          <div
            className="animate-fade-in-up"
            style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem' }}
          >
            {/* Patient Directory */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '1.25rem',
                }}
              >
                <ClipboardList className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Patient Directory
                </h2>
                {patientsPagination.totalPatients > 0 && (
                  <span className="badge badge-teal" style={{ marginLeft: 'auto' }}>
                    {patientsPagination.totalPatients} total
                  </span>
                )}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    className="h-4 w-4"
                    style={{
                      position: 'absolute', left: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="patient-search"
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by name, phone, or email..."
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="form-input"
                  style={{ width: 'auto' }}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Table */}
              {patientsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '3.5rem', width: '100%' }} />
                  ))}
                </div>
              ) : patients.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.875rem',
                  }}
                >
                  No patients match your search.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Contact</th>
                        <th>Age / Sex</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div
                                style={{
                                  width: '2rem',
                                  height: '2rem',
                                  borderRadius: '50%',
                                  background: 'rgba(0,212,170,0.08)',
                                  border: '1px solid rgba(0,212,170,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  color: 'var(--color-teal-400)',
                                  flexShrink: 0,
                                }}
                              >
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
                                  {p.name}
                                </div>
                                {p.email && (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                    {p.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                              <Phone className="h-3 w-3" />
                              {p.phoneNumber}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {p.age} yrs / <span style={{ textTransform: 'capitalize' }}>{p.gender}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleQueueCheckin(p.id, doctorsList[0]?.id)}
                                style={{
                                  background: 'rgba(0,212,170,0.08)',
                                  border: '1px solid rgba(0,212,170,0.2)',
                                  borderRadius: 'var(--radius-md)',
                                  color: 'var(--color-teal-400)',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.625rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-teal-600)'; e.currentTarget.style.color = '#080E1A'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,212,170,0.08)'; e.currentTarget.style.color = 'var(--color-teal-400)'; }}
                              >
                                Check In
                              </button>
                              {user.role === 'ADMIN' && (
                                <button
                                  onClick={() => handleDeletePatient(p.id, p.name)}
                                  style={{
                                    background: 'rgba(244,63,94,0.08)',
                                    border: '1px solid rgba(244,63,94,0.15)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-rose-400)',
                                    padding: '0.25rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title="Delete patient"
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-rose-500)'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; e.currentTarget.style.color = 'var(--color-rose-400)'; }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Page {patientsPagination.page} of {patientsPagination.totalPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    className="btn-secondary"
                    disabled={patientsPagination.page <= 1}
                    onClick={() => fetchPatients(patientsPagination.page - 1)}
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={patientsPagination.page >= patientsPagination.totalPages}
                    onClick={() => fetchPatients(patientsPagination.page + 1)}
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <UserPlus className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  New Registration
                </h2>
              </div>

              <form onSubmit={handleRegisterPatient} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="150"
                      value={regForm.age}
                      onChange={(e) => setRegForm((f) => ({ ...f, age: e.target.value }))}
                      placeholder="35"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Gender *</label>
                    <select
                      value={regForm.gender}
                      onChange={(e) => setRegForm((f) => ({ ...f, gender: e.target.value }))}
                      className="form-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 555-0199"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="jane@example.com"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Medical History</label>
                  <textarea
                    value={regForm.history}
                    onChange={(e) => setRegForm((f) => ({ ...f, history: e.target.value }))}
                    placeholder="Allergies, chronic conditions..."
                    rows={3}
                    className="form-input"
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {regLoading ? 'Registering...' : 'Register Patient'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===== SCHEDULING TAB ===== */}
        {activeTab === 'book' && (
          <div
            className="animate-fade-in-up"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}
          >
            {/* Book Appointment */}
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <CalendarDays className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Book Appointment
                </h2>
              </div>

              <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="form-label">Patient *</label>
                  <select
                    required
                    value={bookForm.patientId}
                    onChange={(e) => setBookForm((f) => ({ ...f, patientId: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">— Choose Patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phoneNumber})</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    If patient is not listed, register them first in the Patients tab.
                  </p>
                </div>

                <div>
                  <label className="form-label">Physician *</label>
                  <select
                    required
                    value={bookForm.doctorId}
                    onChange={(e) => setBookForm((f) => ({ ...f, doctorId: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">— Choose Physician —</option>
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialization} (${d.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookForm.date}
                    onChange={(e) => setBookForm((f) => ({ ...f, date: e.target.value }))}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="form-label">Reason for Visit</label>
                  <input
                    type="text"
                    value={bookForm.reason}
                    onChange={(e) => setBookForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder="Annual checkup, follow-up..."
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {bookLoading ? 'Booking...' : 'Book Appointment'}
                </button>
              </form>
            </div>

            {/* Walk-in Queue */}
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <Activity className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Walk-in Check-In
                </h2>
              </div>

              <div
                className="alert alert-info"
                style={{ marginBottom: '1.25rem', fontSize: '0.8rem' }}
              >
                <Activity className="h-4 w-4 shrink-0" />
                <span>
                  Generate an immediate queue token for walk-in patients.
                  Tokens are assigned atomically — no duplicate numbers.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="form-label">Walk-in Patient *</label>
                  <select
                    id="walkin-patient"
                    value={walkinForm.patientId}
                    onChange={(e) => setWalkinForm((f) => ({ ...f, patientId: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">— Choose Patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Assign Physician *</label>
                  <select
                    id="walkin-doctor"
                    value={walkinForm.doctorId}
                    onChange={(e) => setWalkinForm((f) => ({ ...f, doctorId: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">— Choose Physician —</option>
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (!walkinForm.patientId || !walkinForm.doctorId) {
                      showToast('Select a patient and physician first.', 'error');
                      return;
                    }
                    handleQueueCheckin(walkinForm.patientId, walkinForm.doctorId);
                  }}
                  disabled={walkinLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {walkinLoading ? 'Generating Token...' : 'Generate Queue Token'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== DOCTOR: APPOINTMENTS TAB ===== */}
        {activeTab === 'appointments' && (
          <div className="animate-fade-in-up space-y-6">
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <CalendarDays className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  My Appointments
                </h2>
                <button
                  onClick={fetchDoctorWorklist}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', display: 'flex',
                  }}
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {doctorAppointments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem', fontSize: '0.875rem' }}>
                  No appointments on your schedule.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorAppointments.map((app) => (
                        <tr key={app.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                            {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedPatient(app.patient)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-teal-400)', fontWeight: 700, fontSize: '0.875rem',
                                textDecoration: 'none', padding: 0,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                            >
                              {app.patient?.name || 'Unknown'}
                            </button>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                              Age: {app.patient?.age ?? '—'}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {app.reason || '—'}
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {app.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    const matchedDoc = doctorsList.find((d) => d.userId === user.id);
                                    if (matchedDoc) handleQueueCheckin(app.patientId, matchedDoc.id, app.id);
                                  }}
                                  style={{
                                    background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)',
                                    borderRadius: 'var(--radius-md)', color: 'var(--color-teal-400)',
                                    fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.625rem',
                                    cursor: 'pointer', transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-teal-600)'; e.currentTarget.style.color = '#080E1A'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,212,170,0.08)'; e.currentTarget.style.color = 'var(--color-teal-400)'; }}
                                >
                                  Check In
                                </button>
                                <button
                                  onClick={() => handleCompleteAppointment(app.id)}
                                  style={{
                                    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)',
                                    fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.625rem',
                                    cursor: 'pointer', transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-emerald-500)'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                                >
                                  Complete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Patient History Modal */}
            {selectedPatient && (
              <div className="card animate-fade-in-up">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '3rem', height: '3rem', borderRadius: '50%',
                        background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-teal-400)',
                      }}
                    >
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                        {selectedPatient.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {selectedPatient.gender} · {selectedPatient.age} yrs · {selectedPatient.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    style={{
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)', padding: '0.375rem', cursor: 'pointer',
                      color: 'var(--color-text-muted)', display: 'flex',
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div
                  style={{
                    background: 'rgba(8,14,26,0.5)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                    <Heart className="h-4 w-4" style={{ color: 'var(--color-rose-400)' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Medical History
                    </span>
                  </div>
                  {/* FIX: Optional chaining prevents crash when medicalHistory is null */}
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {selectedPatient.medicalHistory
                      ? selectedPatient.medicalHistory
                      : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No medical history on record.</span>
                    }
                  </p>
                </div>

                <Link href={`/patients/${selectedPatient.id}/history-records`} style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                    View Full Diagnostic Records
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ===== DOCTOR: QUEUE TAB ===== */}
        {activeTab === 'queue' && (
          <div className="animate-fade-in-up">
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <Volume2 className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Active Queue
                </h2>
                <button
                  onClick={fetchDoctorWorklist}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', display: 'flex',
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {doctorQueue.filter(t => t.status !== 'COMPLETED' && t.status !== 'SKIPPED').length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem', fontSize: '0.875rem' }}>
                  No patients in queue.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {doctorQueue
                    .filter(t => t.status !== 'COMPLETED' && t.status !== 'SKIPPED')
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          background: t.status === 'CALLING' ? 'rgba(0,212,170,0.08)' : 'var(--color-surface)',
                          border: `1px solid ${t.status === 'CALLING' ? 'rgba(0,212,170,0.3)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                        }}
                      >
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              fontSize: '2rem',
                              fontWeight: 900,
                              color: t.status === 'CALLING' ? 'var(--color-teal-400)' : 'var(--color-text-secondary)',
                              letterSpacing: '-0.03em',
                              lineHeight: 1,
                            }}
                          >
                            #{t.tokenNumber.toString().padStart(3, '0')}
                          </span>
                          <span className={getStatusBadgeClass(t.status)}>{t.status}</span>
                        </div>

                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                          {t.patient?.name || 'Patient'}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {t.patient?.phoneNumber || '—'}
                        </p>

                        <div className="flex gap-1.5" style={{ marginTop: '1rem' }}>
                          {t.status === 'WAITING' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(t.id, 'CALLING')}
                              className="btn-primary"
                              style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                            >
                              Call Patient
                            </button>
                          )}
                          {t.status === 'CALLING' && (
                            <>
                              <button
                                onClick={() => handleUpdateQueueStatus(t.id, 'COMPLETED')}
                                className="btn-primary"
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                              >
                                Consulted
                              </button>
                              <button
                                onClick={() => handleUpdateQueueStatus(t.id, 'SKIPPED')}
                                className="btn-danger"
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                              >
                                Skip
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ADMIN: REPORTS TAB ===== */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in-up space-y-6">
            {/* Summary Stats */}
            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <StatCard icon={<Users className="h-4 w-4" />} label="Total Patients" value={summary.totalPatients} color="teal" sublabel="All time" />
                <StatCard icon={<Stethoscope className="h-4 w-4" />} label="Physicians" value={summary.totalDoctors} color="violet" sublabel="Active" />
                <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Today's Appts" value={summary.todayAppointments} color="amber" sublabel="Scheduled" />
                <StatCard icon={<Activity className="h-4 w-4" />} label="Queue Today" value={summary.todayQueueTokens} color="rose" sublabel="Tokens issued" />
                <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={summary.pendingAppointments} color="teal" sublabel="Appointments" />
              </div>
            )}

            {/* Reports Panel */}
            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                      Physician Performance Report
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Appointments, completion rates, and revenue breakdown by doctor.
                  </p>
                </div>
                <button
                  onClick={generateSystemReport}
                  disabled={adminReportLoading}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem' }}
                >
                  {adminReportLoading ? (
                    <>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#080E1A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Loading...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>

              {!adminReport ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.875rem',
                  }}
                >
                  Click "Generate Report" to load doctor performance data.
                </div>
              ) : (
                <div>
                  {/* Summary row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {[
                      { label: 'Physicians', value: adminReport.data.length },
                      { label: 'Total Consultations', value: adminReport.data.reduce((s, i) => s + i.totalAppointments, 0) },
                      { label: 'Total Revenue', value: `$${adminReport.data.reduce((s, i) => s + i.revenue, 0).toLocaleString()}`, color: 'var(--color-teal-400)' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color || 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Physician</th>
                          <th>Department</th>
                          <th>Completed / Total</th>
                          <th style={{ textAlign: 'center' }}>Rate</th>
                          <th style={{ textAlign: 'center' }}>Queue Today</th>
                          <th style={{ textAlign: 'right' }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminReport.data.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-teal-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.specialization}</div>
                            </td>
                            <td>{item.department}</td>
                            <td>
                              {item.completedAppointments} / {item.totalAppointments}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={item.completionRate >= 70 ? 'badge badge-emerald' : item.completionRate >= 40 ? 'badge badge-amber' : 'badge badge-rose'}>
                                {item.completionRate}%
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge badge-violet">{item.todayQueueSize}</span>
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-teal-400)', fontWeight: 700 }}>
                              ${item.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ADMIN: PHYSICIANS TAB ===== */}
        {activeTab === 'physicians' && (
          <div className="animate-fade-in-up">
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <Award className="h-5 w-5" style={{ color: 'var(--color-teal-500)' }} />
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Physician Registry
                </h2>
              </div>

              {/* Search */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    className="h-4 w-4"
                    style={{
                      position: 'absolute', left: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by physician name..."
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
                <button
                  onClick={() => fetchDoctors(adminSearch)}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem' }}
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {doctorsList.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.25)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    <div className="flex items-center gap-3" style={{ marginBottom: '0.875rem' }}>
                      <div
                        style={{
                          width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', fontWeight: 800, color: 'var(--color-violet-400)',
                          flexShrink: 0,
                        }}
                      >
                        {doc.name.split(' ').pop()?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-teal-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {doc.specialization}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-violet" style={{ marginBottom: '0.75rem' }}>{doc.department}</span>
                    <div
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)',
                        fontSize: '0.75rem', color: 'var(--color-text-muted)',
                      }}
                    >
                      <span>{doc.experience} yrs exp.</span>
                      <span style={{ color: 'var(--color-teal-400)', fontWeight: 700 }}>${doc.consultationFee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .space-y-6 > * + * { margin-top: 1.5rem; }
      `}</style>
    </div>
  );
}
