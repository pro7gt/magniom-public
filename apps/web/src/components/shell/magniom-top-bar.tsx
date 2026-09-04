'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caseStore } from '../../lib/case-store';
import { CANONICAL_CLINICAL_SESSION } from '../../lib/release-authority';
import type { EnvironmentMode } from '@magniom/presentation';
import { NotificationBell } from '../notification-system';
import { emitAuditEvent } from '../../lib/shell-observability';

const AVAILABLE_ORGANISATIONS = [
  {
    id: 'org-melb-tms',
    name: 'Melbourne TMS Centre',
    siteId: 'site-parkville-01',
    siteName: 'Parkville Clinical Neurosciences',
    displayLabel: 'Melbourne TMS Centre · Site 1',
  },
  {
    id: 'org-syd-research',
    name: 'Sydney NeuroDiscovery Institute',
    siteId: 'site-camperdown-01',
    siteName: 'Camperdown Advanced Imaging',
    displayLabel: 'Sydney NeuroDiscovery · Site 1',
  },
  {
    id: 'org-bris-val',
    name: 'Queensland Brain Health Centre',
    siteId: 'site-herston-01',
    siteName: 'Herston Clinical Research Unit',
    displayLabel: 'Queensland Brain Health · Site 1',
  },
];

interface MagniomTopBarProps {
  currentMode?: EnvironmentMode;
  onModeChange?: (mode: EnvironmentMode) => void;
  failClosed?: boolean;
  failClosedReason?: string;
}

export function MagniomTopBar({
  currentMode = 'CLINICAL',
  onModeChange,
  failClosed = false,
  failClosedReason,
}: MagniomTopBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('org-melb-tms');
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  const activeOrg = AVAILABLE_ORGANISATIONS.find(o => o.id === selectedOrgId) || AVAILABLE_ORGANISATIONS[0]!;

  const handleSwitchOrg = (orgId: string) => {
    if (orgId === selectedOrgId) {
      setIsOrgMenuOpen(false);
      return;
    }
    const previousOrgId = selectedOrgId;
    setSelectedOrgId(orgId);
    setIsOrgMenuOpen(false);

    // §27: Clear active case state and navigate to /cases
    emitAuditEvent('ORGANISATION_SWITCHED', {
      message: `User switched organisation from ${previousOrgId} to ${orgId}. Active case state cleared.`,
      metadata: { previousOrgId, newOrgId: orgId },
    });

    router.push('/cases');
  };

  const allCases = caseStore.getAllCases();
  const session = CANONICAL_CLINICAL_SESSION;

  // Filter cases matching query
  const matchingCases =
    searchQuery.trim().length > 0
      ? allCases.filter(
          c =>
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.indication.toLowerCase().includes(searchQuery.toLowerCase()),
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
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setIsOrgMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut to focus search with '/'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const input = searchContainerRef.current?.querySelector('input');
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      role="banner"
      className={`magniom-top-bar ${failClosed ? 'top-bar-failclosed' : ''}`}
      aria-label="MAGNIOM Top Bar Authority and Global Navigation"
    >
      {/* 1. Left: Brand & Clinical Descriptor */}
      <div className="top-bar-left">
        <Link href="/" className="top-bar-brand" aria-label="MAGNIOM Home">
          <span className="brand-title">MAGNIOM</span>
          <span className="brand-separator" aria-hidden="true">
            |
          </span>
          <span className="brand-descriptor">TMS Target Decision Support</span>
        </Link>
      </div>

      {/* 2. Center: Global Case Search */}
      <div className="top-bar-center" ref={searchContainerRef}>
        <div className="global-search-wrapper">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            className="global-search-input"
            placeholder="Search cases, indications, or IDs... (Press '/' to focus)"
            value={searchQuery}
            onChange={e => {
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
                matchingCases.slice(0, 6).map(c => (
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
                    onKeyDown={e => {
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
        {/* Mode Indicator with Explicit Text (§20–25) */}
        <div className="mode-badge-container">
          {failClosed ? (
            <span
              className="badge badge-danger mode-badge"
              title={failClosedReason || 'Contradictory state detected; clinical targeting locked.'}
            >
              <span className="mode-dot">●</span> FAIL CLOSED
            </span>
          ) : currentMode === 'RESEARCH' ? (
            <span
              className="badge badge-tierexp mode-badge"
              title="Experimental neuroimaging analysis only — Not for clinical decisions"
            >
              <span className="mode-dot">●</span> RESEARCH MODE
            </span>
          ) : currentMode === 'VALIDATION' ? (
            <span
              className="badge badge-tier2 mode-badge"
              title="Controlled study evaluation — Clinical authority restricted by protocol"
            >
              <span className="mode-dot">●</span> VALIDATION MODE
            </span>
          ) : (
            <span
              className="badge badge-tier1 mode-badge"
              title="Authorised specialist clinical decision support"
            >
              <span className="mode-dot">●</span> CLINICAL MODE
            </span>
          )}
        </div>

        {/* Organisation / Site Context & Switcher (§26–27) */}
        <div className="site-context-container" ref={orgMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            title={`Active Site: ${activeOrg.displayLabel}. Click to switch organisation (§27).`}
            aria-expanded={isOrgMenuOpen}
            aria-haspopup="true"
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: 'inherit',
              padding: '4px 6px',
              borderRadius: '4px',
            }}
          >
            <span className="site-icon" aria-hidden="true">
              🏥
            </span>
            <span className="site-label">{activeOrg.displayLabel}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▾</span>
          </button>

          {isOrgMenuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                zIndex: 1000,
                minWidth: '260px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                SWITCH CLINICAL SITE (§27)
              </div>
              {AVAILABLE_ORGANISATIONS.map(org => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrg(org.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    border: 'none',
                    background: org.id === selectedOrgId ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    color: org.id === selectedOrgId ? 'var(--accent-cyan)' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{org.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {org.siteName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Notification Bell (§204–205) */}
        <NotificationBell />

        {/* Authenticated User Menu (§28) */}
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
            <span className="user-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="user-dropdown-menu" role="menu">
              <div className="user-dropdown-header">
                <strong>{session.user.displayName}</strong>
                <div className="user-dropdown-sub">{session.user.roleTitle}</div>
                <div className="authority-status">
                  <span className="authority-badge">
                    {session.user.hasSigningAuthority
                      ? '✓ Signing Authority: Active'
                      : '○ Signing Authority: Not Delegated'}
                  </span>
                  <div className="authority-detail">{session.user.signingAuthorityLevel}</div>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              {/* Operational Mode Switcher (§9, §20) */}
              <div className="user-dropdown-section">
                <span className="dropdown-section-title">Operational Mode</span>
                <div
                  className="mode-switch-group"
                  style={{ display: 'flex', gap: '4px', marginTop: '6px' }}
                >
                  <button
                    className={`mode-toggle-btn ${currentMode === 'CLINICAL' && !failClosed ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('CLINICAL');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Clinical
                  </button>
                  <button
                    className={`mode-toggle-btn ${currentMode === 'VALIDATION' && !failClosed ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('VALIDATION');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Validation
                  </button>
                  <button
                    className={`mode-toggle-btn ${currentMode === 'RESEARCH' && !failClosed ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('RESEARCH');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Research
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
                  🧪 Validation Studies & Golden Cases
                </Link>
                <Link
                  href="/evidence"
                  className="dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  📚 Evidence Knowledge Graph
                </Link>
                <Link
                  href="/help"
                  className="dropdown-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  📖 Clinical Guidance & Glossary
                </Link>
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-footer">
                <span>Release: MAGNIOM v2.0</span>
                <span className="session-secure">🔒 Encrypted TLS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
