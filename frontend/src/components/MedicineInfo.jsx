import React, { useState, useEffect } from 'react';
import {
  PillIcon,
  SearchIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  InfoIcon,
  SparklesIcon,
} from './Icons';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { API_BASE_URL } from '../config';

const POPULAR_MEDICINES = [
  'Paracetamol',
  'Ibuprofen',
  'Amoxicillin',
  'Cetirizine',
  'Metformin',
  'Omeprazole',
];

export default function MedicineInfo({ presetName }) {
  const [medicineName, setMedicineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async (e, overrideName) => {
    if (e) e.preventDefault();
    const query = (overrideName || medicineName).trim();
    if (!query) {
      setError('Please enter a medicine or drug name to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/medicine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status} (${response.statusText})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      console.error('Error fetching medicine info:', err);
      setError(
        err.message ||
          'Failed to retrieve medicine details. Please check that the MediSense backend and Ollama are reachable.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (presetName && presetName.trim()) {
      setMedicineName(presetName);
      handleSearch(null, presetName);
    }
  }, [presetName]);

  const handleChipClick = (name) => {
    setMedicineName(name);
    handleSearch(null, name);
  };

  const isUnknown = result && (result.name === 'Unknown' || !result.name);

  return (
    <div className="medicine-info-page">
      {/* Search Input Card */}
      <div className="white-card form-card">
        <div className="card-header-group">
          <div className="card-icon-pill icon-blue">
            <PillIcon size={22} />
          </div>
          <div>
            <h2 className="card-title">Medicine Information Directory</h2>
            <p className="card-subtitle">
              Look up any prescription or over-the-counter medication to review common indications,
              safety precautions, documented side effects, and general clinical guidance.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => handleSearch(e)} className="medicine-form">
          <div className="search-input-group">
            <div className="search-field-wrapper">
              <SearchIcon size={18} className="search-prefix-icon" />
              <input
                type="text"
                id="medicine-name-input"
                className="text-input search-input"
                placeholder="Enter medicine name (e.g., Paracetamol, Ibuprofen, Amoxicillin)..."
                value={medicineName}
                onChange={(e) => {
                  setMedicineName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              id="medicine-search-button"
              className="btn-primary-action medicine-search-btn"
              disabled={loading || !medicineName.trim()}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <SearchIcon size={18} />
                  <span>Search Medicine</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="quick-suggestions-block">
            <span className="suggestions-label">
              <SparklesIcon size={14} /> Common searches:
            </span>
            <div className="suggestion-chips-list">
              {POPULAR_MEDICINES.map((med, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggestion-chip-btn"
                  onClick={() => handleChipClick(med)}
                  disabled={loading}
                >
                  {med}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner title="MediSense AI is retrieving pharmacology data..." />}

      {/* Error State */}
      {error && !loading && (
        <ErrorMessage
          error={error}
          onRetry={(e) => handleSearch(e)}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Results Display in Cards */}
      {result && !loading && (
        <div className="results-container" id="medicine-results">
          {/* Header Card */}
          <div
            className={`white-card medicine-header-card ${
              isUnknown ? 'medicine-header-unknown' : ''
            }`}
          >
            <div className="medicine-title-group">
              <div className="medicine-avatar-circle">
                <PillIcon size={26} />
              </div>
              <div>
                <span className="medicine-label-badge">
                  {isUnknown ? 'Unverified Medication' : 'Clinical Pharmacology Overview'}
                </span>
                <h3 className="medicine-heading-name">{result.name || medicineName}</h3>
              </div>
            </div>

            {isUnknown && (
              <div className="unknown-notice-box">
                <AlertTriangleIcon size={16} />
                <span>
                  The entered name was not recognized as a registered drug. Please review the clinical
                  notes below.
                </span>
              </div>
            )}
          </div>

          {/* 4 Clean Responsive Cards Grid */}
          <div className="medicine-cards-grid">
            {/* Card 1: Used For */}
            <div className="white-card med-info-card card-used-for">
              <div className="card-sub-header">
                <div className="card-sub-icon-wrap icon-wrap-emerald">
                  <CheckCircleIcon size={18} />
                </div>
                <h3 className="card-section-title">Common Uses & Indications</h3>
              </div>
              {Array.isArray(result.used_for) && result.used_for.length > 0 ? (
                <ul className="clean-feature-list">
                  {result.used_for.map((use, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-check-bullet">
                        <CheckCircleIcon size={14} />
                      </span>
                      <span className="feature-item-text">{use}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-subtext">No specific indications documented.</p>
              )}
            </div>

            {/* Card 2: Precautions */}
            <div className="white-card med-info-card card-precautions">
              <div className="card-sub-header">
                <div className="card-sub-icon-wrap icon-wrap-amber">
                  <ShieldCheckIcon size={18} />
                </div>
                <h3 className="card-section-title">Precautions & Warnings</h3>
              </div>
              {Array.isArray(result.precautions) && result.precautions.length > 0 ? (
                <ul className="clean-feature-list">
                  {result.precautions.map((precaution, index) => (
                    <li key={index} className="feature-item item-caution">
                      <span className="feature-check-bullet caution-bullet">
                        <AlertTriangleIcon size={14} />
                      </span>
                      <span className="feature-item-text">{precaution}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-subtext">No special precautions listed.</p>
              )}
            </div>

            {/* Card 3: Side Effects */}
            <div className="white-card med-info-card card-side-effects">
              <div className="card-sub-header">
                <div className="card-sub-icon-wrap icon-wrap-rose">
                  <AlertTriangleIcon size={18} />
                </div>
                <h3 className="card-section-title">Potential Side Effects</h3>
              </div>
              {Array.isArray(result.side_effects) && result.side_effects.length > 0 ? (
                <div className="side-effects-wrap">
                  {result.side_effects.map((effect, index) => (
                    <div key={index} className="side-effect-chip">
                      <span className="chip-dot"></span>
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-subtext">No common side effects documented.</p>
              )}
            </div>

            {/* Card 4: General Advice */}
            <div className="white-card med-info-card card-general-advice">
              <div className="card-sub-header">
                <div className="card-sub-icon-wrap icon-wrap-indigo">
                  <InfoIcon size={18} />
                </div>
                <h3 className="card-section-title">General Advice & Guidance</h3>
              </div>
              {result.general_advice ? (
                <p className="general-advice-text">{result.general_advice}</p>
              ) : (
                <p className="empty-subtext">Always consult your doctor or pharmacist regarding dosage.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
