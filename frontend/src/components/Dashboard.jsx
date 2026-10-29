import React, { useState, useEffect } from 'react';
import {
  StethoscopeIcon,
  PillIcon,
  AlertTriangleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  HeartPulseIcon,
  RefreshCwIcon,
  AmbulanceIcon,
  CheckCircleIcon,
} from './Icons';
import { API_BASE_URL } from '../config';

export default function Dashboard({ onNavigate, onSearchMedicine, onPreFillSymptoms }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(
        `Could not connect to API server (${API_BASE_URL || 'current host'}). Ensure the backend server is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalTriage =
    stats && (stats.home_care + stats.see_doctor + stats.emergency > 0)
      ? stats.home_care + stats.see_doctor + stats.emergency
      : (stats?.total_checks || 0);

  const getPercent = (count) => {
    if (!totalTriage || totalTriage === 0) return 0;
    return Math.round((count / totalTriage) * 100);
  };

  const getUrgencyBadge = (summary) => {
    const s = (summary || '').toLowerCase();
    if (s.includes('emergency')) {
      return <span className="urgency-pill pill-emergency">Emergency</span>;
    }
    if (s.includes('doctor')) {
      return <span className="urgency-pill pill-doctor">See a doctor</span>;
    }
    if (s.includes('home')) {
      return <span className="urgency-pill pill-home">Home care</span>;
    }
    return <span className="urgency-pill pill-neutral">{summary}</span>;
  };

  return (
    <div className="dashboard-page">
      {/* 1. Welcome Hero Banner */}
      <section className="welcome-banner-card">
        <div className="welcome-banner-content">
          <div className="welcome-tag">
            <HeartPulseIcon size={14} className="pulse-heart-mini" />
            <span>AI Clinical Dashboard & Triage</span>
          </div>
          <h1 className="welcome-heading">Welcome to MediSense</h1>
          <p className="welcome-subtext">
            Your intelligent AI-powered triage and clinical pharmacology companion. Assess
            acute symptoms, inspect medication precautions, and review historical logs with
            privacy-first local intelligence.
          </p>

          <div className="welcome-actions">
            <button
              type="button"
              className="btn-welcome-primary"
              onClick={() => onNavigate('symptoms')}
            >
              <StethoscopeIcon size={18} />
              <span>Check Symptoms</span>
            </button>
            <button
              type="button"
              className="btn-welcome-secondary"
              onClick={() => onNavigate('medicine')}
            >
              <PillIcon size={18} />
              <span>Search Medicine</span>
            </button>
          </div>
        </div>

        {/* Decorative Graphic Element (Non-copied pure SVG styling) */}
        <div className="welcome-decorative-graphic" aria-hidden="true">
          <div className="abstract-glow-circle circle-1"></div>
          <div className="abstract-glow-circle circle-2"></div>
          <div className="medical-emblem-badge">
            <HeartPulseIcon size={46} className="emblem-heart" />
          </div>
        </div>
      </section>

      {/* Error state if backend stats failed */}
      {error && !loading && (
        <div className="dashboard-alert-banner">
          <div className="alert-banner-icon">
            <AlertTriangleIcon size={20} />
          </div>
          <div className="alert-banner-text">
            <strong>Backend Connection Notice:</strong> {error}
          </div>
          <button type="button" className="alert-retry-button" onClick={fetchStats}>
            <RefreshCwIcon size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Four Stat Cards Grid */}
      <section className="stat-cards-grid" aria-label="Quick Statistics">
        {/* Stat 1: Symptom checks */}
        <div className="stat-card" onClick={() => onNavigate('symptoms')} role="button" tabIndex={0}>
          <div className="stat-card-header">
            <span className="stat-card-title">Symptom Checks</span>
            <div className="stat-icon-wrapper icon-indigo">
              <StethoscopeIcon size={20} />
            </div>
          </div>
          <div className="stat-number">
            {loading ? <span className="stat-skeleton shimmer"></span> : (stats?.total_checks ?? 0)}
          </div>
          <div className="stat-footer">
            <span className="stat-trend positive">Active Triage</span>
            <span className="stat-sublabel">Evaluated cases</span>
          </div>
        </div>

        {/* Stat 2: Medicines searched */}
        <div className="stat-card" onClick={() => onNavigate('medicine')} role="button" tabIndex={0}>
          <div className="stat-card-header">
            <span className="stat-card-title">Medicines Searched</span>
            <div className="stat-icon-wrapper icon-blue">
              <PillIcon size={20} />
            </div>
          </div>
          <div className="stat-number">
            {loading ? <span className="stat-skeleton shimmer"></span> : (stats?.medicines_searched ?? 0)}
          </div>
          <div className="stat-footer">
            <span className="stat-trend neutral">Drug Directory</span>
            <span className="stat-sublabel">Safety lookups</span>
          </div>
        </div>

        {/* Stat 3: Emergencies flagged */}
        <div
          className={`stat-card ${(stats?.emergency || 0) > 0 ? 'stat-card-emergency-active' : ''}`}
          onClick={() => onNavigate('history')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">Emergencies Flagged</span>
            <div className="stat-icon-wrapper icon-red">
              <AmbulanceIcon size={20} />
            </div>
          </div>
          <div className="stat-number stat-danger-text">
            {loading ? <span className="stat-skeleton shimmer"></span> : (stats?.emergency ?? 0)}
          </div>
          <div className="stat-footer">
            <span className="stat-trend danger">Priority 1</span>
            <span className="stat-sublabel">Call 112 guidance</span>
          </div>
        </div>

        {/* Stat 4: AI status online/offline with model name */}
        <div className="stat-card stat-ai-card">
          <div className="stat-card-header">
            <span className="stat-card-title">AI Engine Status</span>
            <div className={`stat-icon-wrapper ${stats?.ai_online ? 'icon-emerald' : 'icon-amber'}`}>
              <SparklesIcon size={20} />
            </div>
          </div>
          <div className="stat-ai-row">
            <span className={`ai-status-indicator-dot ${stats?.ai_online ? 'online' : 'offline'}`} />
            <span className="stat-ai-status-text">
              {loading ? 'Checking...' : stats?.ai_online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="stat-footer">
            <span className="stat-model-pill">
              Model: <code>{stats?.model || 'qwen3:8b'}</code>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Dashboard 2-Column Section */}
      <section className="dashboard-content-grid">
        {/* Left Column: Horizontal Bar Chart of Urgency Counts */}
        <div className="dashboard-card triage-breakdown-card">
          <div className="card-section-header">
            <div>
              <h2 className="card-section-title">Triage Urgency Breakdown</h2>
              <p className="card-section-sub">
                Distribution of evaluated patient symptoms by recommended urgency level
              </p>
            </div>
            <button
              type="button"
              className="card-header-action-btn"
              onClick={() => onNavigate('symptoms')}
            >
              <span>New Check</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          <div className="triage-bars-list">
            {/* Bar 1: Home Care */}
            <div className="triage-bar-item">
              <div className="triage-bar-meta">
                <div className="triage-bar-label-group">
                  <span className="triage-color-dot dot-home"></span>
                  <span className="triage-category-name">Home care</span>
                </div>
                <div className="triage-bar-values">
                  <strong className="triage-count">{stats?.home_care ?? 0}</strong>
                  <span className="triage-pct">({getPercent(stats?.home_care ?? 0)}%)</span>
                </div>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={getPercent(stats?.home_care ?? 0)}>
                <div
                  className="progress-fill fill-home"
                  style={{ width: `${getPercent(stats?.home_care ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Bar 2: See a doctor */}
            <div className="triage-bar-item">
              <div className="triage-bar-meta">
                <div className="triage-bar-label-group">
                  <span className="triage-color-dot dot-doctor"></span>
                  <span className="triage-category-name">See a doctor</span>
                </div>
                <div className="triage-bar-values">
                  <strong className="triage-count">{stats?.see_doctor ?? 0}</strong>
                  <span className="triage-pct">({getPercent(stats?.see_doctor ?? 0)}%)</span>
                </div>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={getPercent(stats?.see_doctor ?? 0)}>
                <div
                  className="progress-fill fill-doctor"
                  style={{ width: `${getPercent(stats?.see_doctor ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Bar 3: Emergency */}
            <div className="triage-bar-item">
              <div className="triage-bar-meta">
                <div className="triage-bar-label-group">
                  <span className="triage-color-dot dot-emergency"></span>
                  <span className="triage-category-name">Emergency</span>
                </div>
                <div className="triage-bar-values">
                  <strong className="triage-count text-danger">{stats?.emergency ?? 0}</strong>
                  <span className="triage-pct">({getPercent(stats?.emergency ?? 0)}%)</span>
                </div>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={getPercent(stats?.emergency ?? 0)}>
                <div
                  className="progress-fill fill-emergency"
                  style={{ width: `${getPercent(stats?.emergency ?? 0)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="triage-summary-box">
            <ShieldCheckIcon size={18} className="summary-shield-icon" />
            <p>
              Triage guidance helps prioritize care levels. Severe symptoms such as chest pressure,
              shortness of breath, or sudden weakness are classified immediately as Emergency.
            </p>
          </div>
        </div>

        {/* Right Column: Recent Activity List */}
        <div className="dashboard-card recent-activity-card">
          <div className="card-section-header">
            <div>
              <h2 className="card-section-title">Recent Activity</h2>
              <p className="card-section-sub">Latest triage and medicine searches recorded</p>
            </div>
            <button
              type="button"
              className="card-header-action-btn"
              onClick={() => onNavigate('history')}
            >
              <span>View All</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          {loading ? (
            <div className="activity-skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="activity-skeleton-item shimmer" />
              ))}
            </div>
          ) : !stats?.recent || stats.recent.length === 0 ? (
            <div className="empty-activity-state">
              <ClockIcon size={36} className="empty-icon" />
              <h4>No Recent Activity Yet</h4>
              <p>Your recent symptom evaluations and pharmacology searches will appear here.</p>
              <button
                type="button"
                className="btn-start-action"
                onClick={() => onNavigate('symptoms')}
              >
                Perform First Triage
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {stats.recent.map((item, idx) => {
                const isTriage = item.kind === 'triage';
                return (
                  <div
                    key={idx}
                    className="activity-item"
                    onClick={() => {
                      if (isTriage && onPreFillSymptoms) {
                        onPreFillSymptoms(item.query);
                        onNavigate('symptoms');
                      } else if (!isTriage && onSearchMedicine) {
                        onSearchMedicine(item.query);
                        onNavigate('medicine');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title="Click to view details"
                  >
                    <div className="activity-icon-col">
                      <div className={`activity-icon-circle ${isTriage ? 'triage-circle' : 'medicine-circle'}`}>
                        {isTriage ? <StethoscopeIcon size={16} /> : <PillIcon size={16} />}
                      </div>
                    </div>

                    <div className="activity-details-col">
                      <div className="activity-title-row">
                        <span className="activity-query" title={item.query}>
                          {item.query}
                        </span>
                        {getUrgencyBadge(item.summary)}
                      </div>

                      <div className="activity-meta-row">
                        <span className="activity-kind-pill">
                          {isTriage ? 'Triage Evaluation' : 'Medicine Lookup'}
                        </span>
                        <span className="meta-sep">&bull;</span>
                        <span className="activity-time">{item.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

