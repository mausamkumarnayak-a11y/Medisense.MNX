import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from './Icons';
import { API_BASE_URL } from '../config';

export default function ErrorMessage({ error, onRetry, onDismiss }) {
  if (!error) return null;

  let friendlyTitle = 'Unable to complete your request';
  let friendlyDetail = error;

  if (typeof error === 'string') {
    if (
      error.includes('Failed to fetch') ||
      error.includes('NetworkError') ||
      error.includes('connection refused') ||
      error.includes('500')
    ) {
      friendlyTitle = 'Cannot connect to MediSense Backend';
      friendlyDetail = `Could not reach API server (${API_BASE_URL || 'current host'}). Please ensure the backend server is running.`;
    } else if (error.toLowerCase().includes('timeout')) {
      friendlyTitle = 'Request Timed Out';
      friendlyDetail =
        'The clinical model took longer than usual to respond. Please try submitting again.';
    }
  }

  return (
    <div className="error-alert-card" role="alert">
      <div className="error-icon-box">
        <AlertTriangleIcon size={22} className="error-icon" />
      </div>

      <div className="error-content">
        <h4 className="error-heading">{friendlyTitle}</h4>
        <p className="error-description">{friendlyDetail}</p>

        <div className="error-actions">
          {onRetry && (
            <button type="button" className="error-retry-btn" onClick={onRetry}>
              <RefreshCwIcon size={14} className="retry-icon" />
              Try Again
            </button>
          )}
          {onDismiss && (
            <button type="button" className="error-dismiss-btn" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
