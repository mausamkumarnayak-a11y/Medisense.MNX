import React, { useState, useEffect } from 'react';
import { HeartPulseIcon, ClockIcon } from './Icons';

export default function LoadingSpinner({ title = 'Analyzing with MediSense AI...' }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusMessage = (sec) => {
    if (sec < 5) return 'Connecting to local clinical reasoning engine...';
    if (sec < 12) return 'Analyzing query against medical triage guidelines...';
    if (sec < 20) return 'Cross-referencing urgency levels & potential causes...';
    if (sec < 28) return 'Formatting clinical recommendations & safety advice...';
    return 'Deep reasoning in progress. AI inference can take up to 30 seconds...';
  };

  return (
    <div className="loading-state-wrapper" role="status" aria-live="polite">
      {/* Active Inference Progress Bar & Status Card */}
      <div className="loading-status-card">
        <div className="loading-header-row">
          <div className="pulse-orb-wrapper">
            <span className="pulse-ring-outer"></span>
            <span className="pulse-ring-inner"></span>
            <div className="pulse-icon-box">
              <HeartPulseIcon size={20} className="pulse-heart-icon" />
            </div>
          </div>

          <div className="loading-text-meta">
            <h4 className="loading-title">{title}</h4>
            <p className="loading-step-text">{getStatusMessage(secondsElapsed)}</p>
          </div>

          <div className="loading-timer-pill">
            <ClockIcon size={14} className="timer-icon" />
            <span>{secondsElapsed}s elapsed</span>
          </div>
        </div>

        <div className="loading-track">
          <div
            className="loading-bar-indicator"
            style={{ width: `${Math.min(96, 6 + secondsElapsed * 3.2)}%` }}
          />
        </div>
      </div>

      {/* Clean Loading Skeleton Preview */}
      <div className="skeleton-preview-container" aria-hidden="true">
        <div className="skeleton-badge-banner shimmer"></div>

        <div className="skeleton-card shimmer">
          <div className="skeleton-line skeleton-title shimmer"></div>
          <div className="skeleton-line skeleton-p shimmer"></div>
          <div className="skeleton-line skeleton-p-short shimmer"></div>
        </div>

        <div className="skeleton-grid">
          <div className="skeleton-card shimmer">
            <div className="skeleton-line skeleton-title shimmer"></div>
            <div className="skeleton-item shimmer"></div>
            <div className="skeleton-item shimmer"></div>
          </div>
          <div className="skeleton-card shimmer">
            <div className="skeleton-line skeleton-title shimmer"></div>
            <div className="skeleton-item shimmer"></div>
            <div className="skeleton-item shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
