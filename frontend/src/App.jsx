import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PermanentBanner from './components/PermanentBanner';
import Dashboard from './components/Dashboard';
import SymptomCheck from './components/SymptomCheck';
import MedicineInfo from './components/MedicineInfo';
import History from './components/History';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [prefilledSymptoms, setPrefilledSymptoms] = useState('');
  const [statsKey, setStatsKey] = useState(0);

  // Navigate to Medicine Info and automatically trigger search
  const handleOpenMedicine = (medName) => {
    setSelectedMedicine(medName);
    setActiveTab('medicine');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Symptom Check and pre-fill symptoms
  const handleOpenSymptoms = (symptomsText) => {
    setPrefilledSymptoms(symptomsText);
    setActiveTab('symptoms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger stats / activity refresh across tabs
  const handleHistoryChanged = () => {
    setStatsKey((prev) => prev + 1);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Clinical Dashboard';
      case 'symptoms':
        return 'Symptom Assessment & Triage';
      case 'medicine':
        return 'Medicine Pharmacology Directory';
      case 'history':
        return 'Consultation & Search History';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="medisense-app-root">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main App Workspace */}
      <div className="main-workspace">
        {/* Permanent Subtle Medical Advisory Banner */}
        <PermanentBanner />

        {/* Top Contextual Header */}
        <header className="workspace-header">
          <div className="header-breadcrumbs">
            <span className="breadcrumb-root">MediSense</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{getPageTitle()}</span>
          </div>

          <div className="workspace-header-actions">
            <div className="system-live-pill">
              <span className="status-dot"></span>
              <span className="status-text">Backend Connected</span>
            </div>
          </div>
        </header>

        {/* Main Page Container */}
        <main className="workspace-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={statsKey}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSearchMedicine={handleOpenMedicine}
              onPreFillSymptoms={handleOpenSymptoms}
            />
          )}

          {activeTab === 'symptoms' && (
            <SymptomCheck
              onMedicine={handleOpenMedicine}
              prefilledSymptoms={prefilledSymptoms}
            />
          )}

          {activeTab === 'medicine' && (
            <MedicineInfo presetName={selectedMedicine} />
          )}

          {activeTab === 'history' && (
            <History
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSearchMedicine={handleOpenMedicine}
              onPreFillSymptoms={handleOpenSymptoms}
              onHistoryChanged={handleHistoryChanged}
            />
          )}
        </main>

        {/* Application Footer */}
        <footer className="workspace-footer">
          <div className="footer-inner">
            <p className="footer-disclaimer-text">
              MediSense is an AI triage and pharmacological directory tool for informational purposes only.
              It does not replace professional medical diagnosis, advice, or emergency triage. In life-threatening emergencies, call <strong>112</strong> immediately.
            </p>
            <div className="footer-meta-links">
              <span>MediSense AI Platform</span>
              <span className="meta-divider">&bull;</span>
              <span>Fast Local Inference</span>
              <span className="meta-divider">&bull;</span>
              <span>Emergency 112</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
