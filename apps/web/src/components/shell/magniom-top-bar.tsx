'use client';

import {
  Button,
  Badge,
  Input,
  SearchIcon,
  XIcon,
  Building2Icon,
  ChevronDownIcon,
  CheckIcon,
  FlaskConicalIcon,
  BookOpenIcon,
  FileTextIcon,
  LockIcon,
  ThemeToggle,
  MagniomMark,
} from '@/components/ui';
import { getModeBadgeColor } from '@magniom/ui';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caseStore } from '../../lib/case-store';
import { CANONICAL_CLINICAL_SESSION } from '../../lib/release-authority';
import type { EnvironmentMode } from '@magniom/presentation';
import { NotificationBell } from '../notification-system';
import { emitAuditEvent } from '../../lib/shell-observability';
import { authStore, type ClinicianAuthSession } from '../../lib/auth-store';

const AVAILABLE_ORGANISATIONS = [
  {
    id: 'org-melb-tms',
    name: 'Melbourne TMS Centre',
    siteId: 'site-surrey-hills-01',
    siteName: 'Surrey Hills Clinic',
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

  const activeOrg =
    AVAILABLE_ORGANISATIONS.find(o => o.id === selectedOrgId) || AVAILABLE_ORGANISATIONS[0]!;

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
  const [activeSession, setActiveSession] = useState<ClinicianAuthSession | null>(() =>
    authStore.getAuthSession(),
  );

  useEffect(() => {
    setActiveSession(authStore.getAuthSession());
    const unsubscribe = authStore.subscribe(updated => {
      setActiveSession(updated);
    });
    return () => unsubscribe();
  }, []);

  const session = activeSession || CANONICAL_CLINICAL_SESSION;

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
          <MagniomMark size={26} className="brand-logo-mark" aria-hidden="true" />
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
          <span className="search-icon inline-flex items-center" aria-hidden="true">
            <SearchIcon size={16} />
          </span>
          <Input
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
            <Button
              variant="ghost"
              size="sm"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              aria-label="Clear search query"
            >
              <XIcon size={14} />
            </Button>
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
                      <Badge variant="neutral">{c.indication}</Badge>
                      {c.isStale && <Badge variant="tier3">STALE</Badge>}
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
        {/* Center: Environment Mode Badge & Safety Lock Indicators (§25, §32) */}
        <div className="mode-badge-container" data-mode-color={getModeBadgeColor(currentMode)}>
          {failClosed ? (
            <Badge
              variant="danger"
              className="mode-badge"
              title={failClosedReason || 'Contradictory state detected; clinical targeting locked.'}
            >
              <span className="mode-dot">●</span> FAIL CLOSED
            </Badge>
          ) : currentMode === 'RESEARCH' ? (
            <Badge
              variant="tierexp"
              className="mode-badge"
              title="Experimental neuroimaging analysis only — Not for clinical decisions"
            >
              <span className="mode-dot text-amber">●</span> RESEARCH MODE
            </Badge>
          ) : currentMode === 'VALIDATION' ? (
            <Badge
              variant="tier2"
              className="mode-badge"
              title="Controlled study evaluation — Clinical authority restricted by protocol"
            >
              <span className="mode-dot text-cyan">●</span> VALIDATION MODE
            </Badge>
          ) : (
            <Badge
              variant="tier1"
              className="mode-badge"
              title="Authorised specialist clinical decision support"
            >
              <span className="mode-dot text-emerald">●</span> CLINICAL MODE
            </Badge>
          )}
        </div>

        {/* Organisation / Site Context & Switcher (§26–27) */}
        <div className="site-context-container relative" ref={orgMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            className="site-indicator-btn flex items-center gap-1.5 px-1.5 py-1"
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            title={`Active Site: ${activeOrg.displayLabel}. Click to switch organisation (§27).`}
            aria-expanded={isOrgMenuOpen}
            aria-haspopup="true"
          >
            <span className="site-icon inline-flex items-center" aria-hidden="true">
              <Building2Icon size={16} />
            </span>
            <span className="site-label">{activeOrg.displayLabel}</span>
            <ChevronDownIcon size={12} className="text-muted" />
          </Button>

          {isOrgMenuOpen && (
            <div role="menu" className="site-dropdown-menu">
              <div className="px-3 py-2 border-b-subtle text-xs text-muted font-semibold">
                SWITCH CLINICAL SITE (§27)
              </div>
              {AVAILABLE_ORGANISATIONS.map(org => (
                <Button
                  key={org.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSwitchOrg(org.id)}
                  className={`block w-full text-left px-3 py-2 border-0 text-xs ${
                    org.id === selectedOrgId
                      ? 'bg-surface-elevated text-cyan font-semibold'
                      : 'text-primary'
                  }`}
                >
                  <div className="font-semibold">{org.name}</div>
                  <div className="text-xs text-secondary">{org.siteName}</div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Notification Bell (§204–205) */}
        <NotificationBell />

        {/* Authenticated User Menu (§28) */}
        <div className="user-menu-container" ref={userMenuRef}>
          <Button
            variant="ghost"
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
          </Button>

          {isUserMenuOpen && (
            <div className="user-dropdown-menu" role="menu">
              <div className="user-dropdown-header">
                <strong>{session.user.displayName}</strong>
                <div className="user-dropdown-sub">{session.user.roleTitle}</div>
                <div className="authority-status">
                  <Badge
                    variant={session.user.hasSigningAuthority ? 'tier1' : 'neutral'}
                    className="authority-badge"
                  >
                    {session.user.hasSigningAuthority ? (
                      <>
                        <CheckIcon size={12} className="inline-block" /> Signing Authority: Active
                      </>
                    ) : (
                      '○ Signing Authority: Not Delegated'
                    )}
                  </Badge>
                  <div className="authority-detail">{session.user.signingAuthorityLevel}</div>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              {/* Operational Mode Switcher (§9, §20) */}
              <div className="user-dropdown-section">
                <span className="dropdown-section-title">Operational Mode</span>
                <div className="mode-switch-group flex gap-1 mt-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`mode-toggle-btn ${currentMode === 'CLINICAL' && !failClosed ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('CLINICAL');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Clinical
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`mode-toggle-btn ${currentMode === 'VALIDATION' && !failClosed ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('VALIDATION');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Validation
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`mode-toggle-btn ${currentMode === 'RESEARCH' && !failClosed ? 'active' : ''}`}
                    onClick={() => {
                      if (onModeChange) onModeChange('RESEARCH');
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Research
                  </Button>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              {/* Appearance: Theme Toggle */}
              <div className="user-dropdown-section">
                <span className="dropdown-section-title">Appearance</span>
                <ThemeToggle />
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-links">
                <Link
                  href="/validation"
                  className="dropdown-link flex items-center gap-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FlaskConicalIcon size={14} /> Validation Studies & Golden Cases
                </Link>
                <Link
                  href="/evidence"
                  className="dropdown-link flex items-center gap-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <BookOpenIcon size={14} /> Evidence Knowledge Graph
                </Link>
                <Link
                  href="/help"
                  className="dropdown-link flex items-center gap-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FileTextIcon size={14} /> Clinical Guidance & Glossary
                </Link>
              </div>

              <div className="user-dropdown-divider" />

              {/* Session Control / Sign Out */}
              <div className="user-dropdown-section">
                <Button
                  variant="ghost"
                  size="sm"
                  id="top-bar-sign-out-btn"
                  className="w-full justify-start text-xs text-danger flex items-center gap-2"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await authStore.logoutClinicianAsync();
                    window.location.replace('/login');
                  }}
                >
                  <LockIcon size={13} /> Sign Out / Lock Workstation
                </Button>
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-footer">
                <span>Release: MAGNIOM v2.0</span>
                <span className="session-secure inline-flex items-center gap-1">
                  <LockIcon size={12} /> Encrypted TLS
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
