import React from 'react';
import { ShieldCheckIcon } from './Icons';

export default function PermanentBanner() {
  return (
    <div className="subtle-medical-banner" role="note" aria-label="Medical advisory">
      <div className="subtle-banner-inner">
        <div className="subtle-banner-icon-wrapper">
          <ShieldCheckIcon size={16} className="subtle-banner-icon" />
        </div>
        <div className="subtle-banner-text">
          <span className="subtle-banner-bold">Not medical advice. Consult a doctor.</span>
          <span className="subtle-banner-sep" aria-hidden="true">&bull;</span>
          <span className="subtle-banner-desc">
            Informational triage only. For life-threatening emergencies, call{' '}
            <strong className="emergency-num-highlight">112</strong> immediately.
          </span>
        </div>
      </div>
    </div>
  );
}
