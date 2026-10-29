import React, { useState } from 'react';
import {
  DashboardIcon,
  StethoscopeIcon,
  PillIcon,
  HistoryIcon,
  CrossIcon,
  HeartPulseIcon,
  MenuIcon,
  XIcon,
} from './Icons';
import { API_BASE_URL } from '../config';

export default function Sidebar({ activeTab, onSelectTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon size={19} />,
      badge: null,
    },
    {
      id: 'symptoms',
      label: 'Symptom Check',
      icon: <StethoscopeIcon size={19} />,
      badge: 'AI Triage',
    },
    {
      id: 'medicine',
      label: 'Medicine Info',
      icon: <PillIcon size={19} />,
      badge: 'Directory',
    },
    {
      id: 'history',
      label: 'History',
      icon: <HistoryIcon size={19} />,
      badge: null,
    },
  ];

  const handleNavClick = (id) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar (Visible only on <= 900px screens) */}
      <header className="mobile-top-bar" aria-label="Mobile Navigation Bar">
        <div className="mobile-brand-group">
          <div className="mobile-brand-logo">
            <HeartPulseIcon size={20} className="brand-pulse-svg" />
          </div>
          <div>
            <span className="mobile-brand-title">MediSense</span>
            <span className="mobile-brand-sub">Clinical AI</span>
          </div>
        </div>

        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle mobile navigation menu"
        >
          {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation Sidebar"
      >
        {/* Brand Logo Header */}
        <div className="sidebar-brand-section">
          <div className="sidebar-brand-link">
            <div className="sidebar-logo-box">
              <CrossIcon size={22} className="logo-cross-back" />
              <HeartPulseIcon size={22} className="logo-pulse-front" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">MediSense</span>
              <span className="sidebar-brand-tag">Clinical Dashboard</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav-menu">
          <div className="sidebar-nav-label">Main Navigation</div>
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="sidebar-nav-item">
                  <button
                    type="button"
                    id={`nav-${item.id}`}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-btn-icon">{item.icon}</span>
                    <span className="nav-btn-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-btn-badge ${isActive ? 'badge-active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer Meta */}
        <div className="sidebar-footer-section">
          <div className="sidebar-status-card">
            <div className="sidebar-status-header">
              <span className="status-live-beacon"></span>
              <span className="sidebar-status-title">Clinical AI Engine</span>
            </div>
            <p className="sidebar-status-desc">
              Connected to <code>{API_BASE_URL ? API_BASE_URL.replace(/^https?:\/\//, '') : 'production'}</code>
            </p>
          </div>

          <div className="sidebar-version-text">
            <span>MediSense AI v2.4</span>
            <span className="version-sep">&bull;</span>
            <span>Emergency 112</span>
          </div>
        </div>
      </aside>
    </>
  );
}

