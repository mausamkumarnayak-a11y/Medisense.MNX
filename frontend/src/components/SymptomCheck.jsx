import React, { useState, useEffect } from 'react';
import {
  StethoscopeIcon,
  ShieldCheckIcon,
  AmbulanceIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  PillIcon,
  UserIcon,
  SparklesIcon,
  ArrowRightIcon,
} from './Icons';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { API_BASE_URL } from '../config';

const QUICK_EXAMPLES = [
  {
    label: 'Mild headache & eye strain',
    text: 'Persistent mild throbbing headache across forehead, dry eyes after screen work, no nausea.',
  },
  {
    label: 'Flu-like symptoms',
    text: 'Low-grade fever (100.4 F), runny nose, fatigue, and scratchy throat for 2 days.',
  },
  {
    label: 'Sharp chest tightness',
    text: 'Sudden pressure in center of chest radiating to left arm with mild shortness of breath.',
  },
  {
    label: 'Sprained ankle with swelling',
    text: 'Twisted ankle while jogging, noticeable swelling and difficulty putting weight on it.',
  },
];

export default function SymptomCheck({ onMedicine, prefilledSymptoms }) {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (prefilledSymptoms) {
      setSymptoms(prefilledSymptoms);
    }
  }, [prefilledSymptoms]);

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms before requesting triage evaluation.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          age: Number(age) || 25,
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
      console.error('Error during triage:', err);
      setError(
        err.message ||
          'Failed to analyze symptoms. Please check that the MediSense backend and Ollama model are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyDetails = (urgency = '') => {
    const norm = urgency.toLowerCase().trim();
    if (norm.includes('emergency')) {
      return {
        type: 'emergency',
        label: 'Emergency',
        badgeClass: 'badge-urgency-emergency',
        icon: <AmbulanceIcon size={32} className="urgency-badge-icon pulse-alert" />,
        guidance:
          'Immediate clinical evaluation required. Call 112 or visit an emergency department immediately.',
      };
    }
    if (norm.includes('doctor') || norm.includes('see a doctor')) {
      return {
        type: 'doctor',
        label: 'See a doctor',
        badgeClass: 'badge-urgency-doctor',
        icon: <StethoscopeIcon size={32} className="urgency-badge-icon" />,
        guidance:
          'A doctor or healthcare provider should evaluate these symptoms in person or via telehealth consultation.',
      };
    }
    if (norm.includes('home') || norm.includes('care')) {
      return {
        type: 'home',
        label: 'Home care',
        badgeClass: 'badge-urgency-home',
        icon: <ShieldCheckIcon size={32} className="urgency-badge-icon" />,
        guidance:
          'Safe to monitor at home with rest, hydration, and over-the-counter care unless symptoms worsen.',
      };
    }
    return {
      type: 'doctor',
      label: urgency || 'See a doctor',
      badgeClass: 'badge-urgency-doctor',
      icon: <AlertTriangleIcon size={32} className="urgency-badge-icon" />,
      guidance: 'Consult a qualified healthcare professional for clinical advice.',
    };
  };

  return (
    <div className="symptom-check-page">
      {/* Intro Form Card */}
      <div className="white-card form-card">
        <div className="card-header-group">
          <div className="card-icon-pill icon-indigo">
            <StethoscopeIcon size={22} />
          </div>
          <div>
            <h2 className="card-title">Symptom Assessment & Triage</h2>
            <p className="card-subtitle">
              Describe your symptoms and patient age to receive an instant AI triage classification,
              possible causes, and doctor discussion points.
            </p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="symptom-form">
          <div className="form-group">
            <label htmlFor="symptoms-input" className="form-label">
              <span>What symptoms are you experiencing?</span>
              <span className="required-star">*</span>
            </label>
            <textarea
              id="symptoms-input"
              className="text-input textarea-input"
              rows={4}
              placeholder="Describe your symptoms in detail (e.g., throbbing headache on right side for 2 days, mild nausea, sensitivity to bright light)..."
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              required
            />
          </div>

          {/* Quick Example Chips */}
          <div className="quick-suggestions-block">
            <span className="suggestions-label">
              <SparklesIcon size={14} /> Quick examples:
            </span>
            <div className="suggestion-chips-list">
              {QUICK_EXAMPLES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggestion-chip-btn"
                  onClick={() => setSymptoms(item.text)}
                  disabled={loading}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row-age-action">
            <div className="form-group age-group">
              <label htmlFor="age-input" className="form-label">
                <UserIcon size={15} className="inline-label-icon" />
                <span>Patient Age</span>
              </label>
              <div className="age-input-wrapper">
                <input
                  type="number"
                  id="age-input"
                  className="text-input age-input"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="age-unit">years</span>
              </div>
            </div>

            <div className="form-action-group">
              <button
                type="submit"
                id="check-button"
                className="btn-primary-action"
                disabled={loading || !symptoms.trim()}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <StethoscopeIcon size={18} />
                    <span>Check Symptoms</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner title="MediSense AI is evaluating your symptoms..." />}

      {/* Error State */}
      {error && !loading && (
        <ErrorMessage
          error={error}
          onRetry={handleCheck}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="results-container" id="symptom-results">
          {/* Big Colored Urgency Badge */}
          {(() => {
            const urgencyInfo = getUrgencyDetails(result.urgency);
            return (
              <div className={`urgency-banner-card ${urgencyInfo.badgeClass}`}>
                <div className="urgency-badge-main">
                  <div className="urgency-icon-circle">{urgencyInfo.icon}</div>
                  <div className="urgency-text-meta">
                    <span className="urgency-overline">Triage Urgency Level</span>
                    <h3 className="urgency-level-title">{result.urgency || urgencyInfo.label}</h3>
                  </div>
                </div>
                <div className="urgency-guidance-pill">
                  <p>{urgencyInfo.guidance}</p>
                </div>
              </div>
            );
          })()}

          {/* Explanation Card */}
          {result.explanation && (
            <div className="white-card explanation-card">
              <div className="card-sub-header">
                <SparklesIcon size={20} className="card-sub-icon text-indigo" />
                <h3 className="card-section-title">Clinical Assessment Explanation</h3>
              </div>
              <p className="explanation-paragraph">{result.explanation}</p>
            </div>
          )}

          {/* Grid: Possible Causes & Doctor Discussion */}
          <div className="results-two-col-grid">
            {/* Possible Causes Card */}
            <div className="white-card causes-card">
              <div className="card-sub-header">
                <AlertTriangleIcon size={20} className="card-sub-icon text-amber" />
                <h3 className="card-section-title">Possible Causes</h3>
              </div>
              {Array.isArray(result.possible_causes) && result.possible_causes.length > 0 ? (
                <ul className="causes-list">
                  {result.possible_causes.map((cause, index) => (
                    <li key={index} className="cause-item">
                      <span className="cause-bullet-badge">{index + 1}</span>
                      <span className="cause-text">{cause}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-subtext">No specific causes identified for this query.</p>
              )}
            </div>

            {/* Tell the Doctor Card */}
            <div className="white-card doctor-card">
              <div className="card-sub-header">
                <CheckCircleIcon size={20} className="card-sub-icon text-blue" />
                <h3 className="card-section-title">What to Tell Your Doctor</h3>
              </div>
              {Array.isArray(result.tell_the_doctor) && result.tell_the_doctor.length > 0 ? (
                <ul className="tell-doctor-list">
                  {result.tell_the_doctor.map((point, index) => (
                    <li key={index} className="tell-doctor-item">
                      <CheckCircleIcon size={16} className="tell-doctor-check" />
                      <span className="tell-doctor-text">{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-subtext">
                  Mention the onset, duration, severity, and any recent medications taken.
                </p>
              )}
            </div>
          </div>

          {/* Common Over-the-Counter Medicines Card */}
          <div className="white-card medicines-card">
            <div className="card-sub-header">
              <PillIcon size={20} className="card-sub-icon text-emerald" />
              <div>
                <h3 className="card-section-title">Common Over-the-Counter Options</h3>
                <span className="card-sub-hint">Click any medicine to view detailed pharmacology</span>
              </div>
            </div>

            {Array.isArray(result.common_medicines) && result.common_medicines.length > 0 ? (
              <div>
                <div className="otc-chips-container">
                  {result.common_medicines.map((med, index) => (
                    <button
                      key={index}
                      type="button"
                      className="otc-med-pill-btn"
                      onClick={() => onMedicine && onMedicine(String(med))}
                      title={`Search details for ${med}`}
                    >
                      <PillIcon size={14} className="otc-pill-icon" />
                      <span className="otc-pill-name">{String(med)}</span>
                      <ArrowRightIcon size={12} className="otc-arrow-icon" />
                    </button>
                  ))}
                </div>
                <p className="otc-disclaimer">
                  * Note: Over-the-counter options are general suggestions. Always check for drug
                  interactions, allergies, contraindications, and correct dosing with a physician or pharmacist.
                </p>
              </div>
            ) : (
              <p className="empty-subtext">
                No specific over-the-counter medicines recommended for these symptoms. Please consult a doctor.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
