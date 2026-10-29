import React, { useState, useEffect } from 'react';
import {
  HistoryIcon,
  TrashIcon,
  StethoscopeIcon,
  PillIcon,
  RefreshCwIcon,
  ClockIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  SearchIcon,
} from './Icons';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { API_BASE_URL } from '../config';

export default function History({ onNavigate, onSearchMedicine, onPreFillSymptoms, onHistoryChanged }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState('all'); // 'all' | 'triage' | 'medicine'
  const [clearSuccess, setClearSuccess] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setHistoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(
        `Could not retrieve history from API server (${API_BASE_URL || 'current host'}). Ensure the backend server is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your MediSense consultation and search history?')) {
      return;
    }

    setClearing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/history`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      setHistoryItems([]);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
      if (onHistoryChanged) onHistoryChanged();
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history. Please check connection to the backend.');
    } finally {
      setClearing(false);
    }
  };

  const getUrgencyBadge = (summary, kind) => {
    if (kind !== 'triage') {
      return <span className="urgency-pill pill-neutral">{summary}</span>;
    }
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

  const filteredItems = historyItems.filter((item) => {
    if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.query || '').toLowerCase().includes(term) ||
      (item.summary || '').toLowerCase().includes(term) ||
      (item.time || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="history-page">
      {/* Header Card */}
      <div className="white-card history-header-card">
        <div className="history-header-left">
          <div className="card-icon-pill icon-indigo">
            <HistoryIcon size={22} />
          </div>
          <div>
            <h2 className="card-title">Consultation & Search History</h2>
            <p className="card-subtitle">
              Review previous AI symptom assessments and medicine pharmacology lookups stored in your
              local session history.
            </p>
          </div>
        </div>

        <div className="history-header-actions">
          <button
            type="button"
            className="btn-refresh-history"
            onClick={fetchHistory}
            disabled={loading || clearing}
            title="Refresh history logs"
          >
            <RefreshCwIcon size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            id="clear-history-button"
            className="btn-clear-history"
            onClick={handleClearHistory}
            disabled={loading || clearing || historyItems.length === 0}
            title="Delete all history entries"
          >
            <TrashIcon size={16} />
            <span>{clearing ? 'Clearing...' : 'Clear history'}</span>
          </button>
        </div>
      </div>

      {clearSuccess && (
        <div className="success-banner-card animate-fade-in">
          <span>Your consultation and search history has been successfully cleared.</span>
        </div>
      )}

      {error && !loading && (
        <ErrorMessage error={error} onRetry={fetchHistory} onDismiss={() => setError(null)} />
      )}

      {/* Filter and Search Bar */}
      {historyItems.length > 0 && (
        <div className="white-card history-toolbar-card">
          <div className="history-search-wrapper">
            <SearchIcon size={16} className="history-search-icon" />
            <input
              type="text"
              className="history-search-input"
              placeholder="Filter history by query, diagnosis, or medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="history-filter-pills">
            <button
              type="button"
              className={`filter-pill-btn ${kindFilter === 'all' ? 'active' : ''}`}
              onClick={() => setKindFilter('all')}
            >
              All Records ({historyItems.length})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${kindFilter === 'triage' ? 'active' : ''}`}
              onClick={() => setKindFilter('triage')}
            >
              <StethoscopeIcon size={14} />
              <span>Symptom Triage</span>
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${kindFilter === 'medicine' ? 'active' : ''}`}
              onClick={() => setKindFilter('medicine')}
            >
              <PillIcon size={14} />
              <span>Medicine Lookups</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="white-card history-table-card">
        {loading ? (
          <div className="history-loading-container">
            <LoadingSpinner title="Retrieving history logs..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="history-empty-container">
            <div className="empty-history-icon-circle">
              <HistoryIcon size={38} />
            </div>
            <h3>No History Records Found</h3>
            <p>
              {historyItems.length === 0
                ? 'You have not performed any symptom checks or medicine searches yet.'
                : 'No history entries matched your search filter.'}
            </p>
            {historyItems.length === 0 && (
              <div className="empty-history-actions">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => onNavigate('symptoms')}
                >
                  <StethoscopeIcon size={16} />
                  <span>Start Symptom Check</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="history-table" aria-label="Consultation and medicine history">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '130px' }}>Category</th>
                  <th scope="col">Query / Symptoms</th>
                  <th scope="col" style={{ width: '170px' }}>Result / Summary</th>
                  <th scope="col" style={{ width: '190px' }}>Date & Time</th>
                  <th scope="col" style={{ width: '120px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const isTriage = item.kind === 'triage';
                  return (
                    <tr key={index} className="history-row">
                      {/* Kind Badge */}
                      <td>
                        <span className={`kind-badge ${isTriage ? 'kind-triage' : 'kind-medicine'}`}>
                          {isTriage ? (
                            <>
                              <StethoscopeIcon size={13} />
                              <span>Triage</span>
                            </>
                          ) : (
                            <>
                              <PillIcon size={13} />
                              <span>Medicine</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Query Text */}
                      <td className="query-cell">
                        <div className="query-text-wrap" title={item.query}>
                          {item.query}
                        </div>
                      </td>

                      {/* Result / Urgency */}
                      <td>
                        {getUrgencyBadge(item.summary, item.kind)}
                      </td>

                      {/* Time */}
                      <td className="time-cell">
                        <div className="time-pill">
                          <ClockIcon size={13} />
                          <span>{item.time}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="action-cell" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-row-action"
                          onClick={() => {
                            if (isTriage && onPreFillSymptoms) {
                              onPreFillSymptoms(item.query);
                              onNavigate('symptoms');
                            } else if (!isTriage && onSearchMedicine) {
                              onSearchMedicine(item.query);
                              onNavigate('medicine');
                            }
                          }}
                          title={isTriage ? 'Re-evaluate in Symptom Check' : 'Look up medicine details'}
                        >
                          <span>{isTriage ? 'Re-check' : 'View'}</span>
                          <ArrowRightIcon size={12} />
                        </button>
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
  );
}

