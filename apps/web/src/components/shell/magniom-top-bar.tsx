'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caseStore } from '../../lib/case-store';
import { CANONICAL_CLINICAL_SESSION } from '../../lib/release-authority';
import type { EnvironmentMode } from '@magniom/presentation';

interface MagniomTopBarProps {
  currentMode?: EnvironmentMode;
  onModeChange?: (mode: EnvironmentMode) => void;
}

export function MagniomTopBar({ currentMode = 'CLINICAL', onModeChange }: MagniomTopBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const allCases = caseStore.getAllCases();
  const session = CANONICAL_CLINICAL_SESSION;

  // Filter cases matching query
  const matchingCases = searchQuery.trim().length > 0
    ? allCases.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.indication.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut to focus search with '/'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = searchContainerRef.current?.querySelector('input');
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isResearch = currentMode === 'RESEARCH';

  return (
    <header role="banner" className="magniom-top-bar" aria-label="MAGNIOM Top Bar Authority and Global Navigation">
      {/* 1. Left: Brand & Clinical Descriptor */}
      <div className="top-bar-left">
        <Link href="/" className="top-bar-brand" aria-label="MAGNIOM Home">
          <span className="brand-title">MAGNIOM</span>
          <span className="brand-separator" aria-hidden="true">|</span>
          <span className="brand-descriptor">TMS Target Decision Support</span>
        </Link>
      </div>

      {/* 2. Center: Global Case Search */}
      <div className="top-bar-center" ref={searchContainerRef}>
        <div className="global-search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="global-search-input"
            placeholder="Search cases, indications, or IDs... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            aria-label="Global Case Search"
            aria-expanded={isSearchOpen && matchingCases.length > 0}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}

          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="search-results-dropdown" role="listbox">
              {matchingCases.length > 0 ? (
                matchingCases.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    className="search-result-item"
                    role="option"
                    tabIndex={0}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      router.push(`/cases/${c.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        router.push(`/cases/${c.id}`);
                      }
                    }}
                  >
                    <div className="search-result-header">
                      <strong className="search-case-code">{c.code}</strong>
                      <span className="badge badge-neutral">{c.indication}</span>
                      {c.isStale && <span className="badge badge-tier3">STALE</span>}
                    </div>
                    <div className="search-case-title">{c.title}</div>
                  </div>
                ))
              ) : (
                <div className="search-no-results">
                  No cases found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Right: Mode Badge, Organisation/Site Context, User Profile */}
      <div className="top-bar-right">
        {/* Mode Indicator */}
        <div className="mode-badge-container">
          {isResearch ? (
            <span className="badge badge-tierexp mode-badge" title="Experimental neuroimaging analysis only">
              <span className="mode-dot">●</span> RESEARCH PROTOTYPE
            </span>
          ) : (
            <span className="badge badge-tier1 mode-badge" title="Authorised specialist clinical decision support">
              <span className="mode-dot">●</span> CLINICAL MODE
            </span>
          )}
        </div>

        {/* Organisation / Site Context */}
        <div className="site-context-container" title={`${session.organization.organizationName} — ${session.organization.siteName}`}>
          <span className="site-icon" aria-hidden="true">🏥</span>
          <span className="site-label">{session.organization.displayLabel}</span>
        </div>

        {/* Authenticated User Menu */}
        <div className="user-menu-container" ref={userMenuRef}>
          <button
            className="user-menu-button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            aria-label={`User session: ${session.user.displayName}, ${session.user.roleTitle}`}
          >
            <div className="user-avatar">{session.user.initials}</div>
            <div className="user-details">
              <span className="user-name">{session.user.displayName}</span>
              <span className="user-role">{session.user.roleTitle}</span>
            </div>
            <span className="user-caret" aria-hidden="true">▾</span>
          </button>

          {isUserMenuOpen && (
            <div className="user-dropdown-menu" role="menu">
              <div className="user-dropdown-header">
                <strong>{session.user.displayName}</strong>
                <div className="user-dropdown-sub">{session.user.roleTitle}</div>
                <div className="authority-status">
                  <span className="authority-badge">✓ Signing Authority: Active</span>
                  <div className="authority-detail">{session.user.signingAuthorityLevel}</div>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-section">
                <span className="dropdown-section-title">Operational Mode</span>
                <div className="mode-switch-group">
                  <button
                    className={`mode-toggle-btn ${!isResearch ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('CLINICAL');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Clinical Mode
                  </button>
                  <button
                    className={`mode-toggle-btn ${isResearch ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('RESEARCH');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Research Mode
                  </button>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-links">
                <Link
                  href="/validation"
                  className="dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  🧪 Validation & Golden Cases Suite
                </Link>
                <Link
                  href="/help"
                  className="dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  📖 Clinical Guidance & Help
                </Link>
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-footer">
                <span>Session ID: SES-9942</span>
                <span className="session-secure">🔒 Encrypted TLS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
