'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { caseStore } from '../../lib/case-store';

interface GlobalSidebarProps {
  initialCollapsed?: boolean;
}

export function GlobalSidebar({ initialCollapsed = false }: GlobalSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  // Extract caseId if inside /cases/[caseId] route
  const caseMatch = pathname.match(/^\/cases\/([^/]+)/);
  const activeCaseId = caseMatch ? caseMatch[1] : undefined;
  const isCaseWorkspace = Boolean(activeCaseId && activeCaseId !== 'new');

  const activeRecord = activeCaseId ? caseStore.getCaseRecord(activeCaseId) : undefined;
  const activeCaseCode = activeRecord?.clinicalCase.caseCode || activeCaseId;

  // Persist sidebar collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('magniom_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('magniom_sidebar_collapsed', String(nextState));
  };

  return (
    <nav
      role="navigation"
      className={`global-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
      aria-label={isCaseWorkspace ? `Case Navigation for ${activeCaseCode}` : 'Global Application Navigation'}
    >
      {/* Sidebar Collapse/Expand Toggle Button */}
      <div className="sidebar-header-toggle">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {isCaseWorkspace ? (
        /* ========================================================================= */
        /* CASE WORKSPACE NAVIGATION (Pattern A - Section 51, 52, 53)               */
        /* ========================================================================= */
        <div className="case-navigation-group">
          {/* Back to All Cases link (§53) */}
          <Link href="/cases" className="sidebar-back-link" title="Return to Clinical Case Registry">
            <span className="back-icon" aria-hidden="true">←</span>
            {!isCollapsed && <span className="back-text">All Cases</span>}
          </Link>

          {/* Active Case Context Chip */}
          <div className="sidebar-case-identity">
            <span className="case-badge-pill" style={{ fontFamily: 'var(--font-mono)' }}>
              {isCollapsed ? activeCaseCode?.slice(-4) : activeCaseCode}
            </span>
            {!isCollapsed && activeRecord && (
              <span className="case-indication-sub">{activeRecord.clinicalCase.indicationCode}</span>
            )}
          </div>

          <div className="sidebar-divider" />

          {/* Case Workflow Navigation Items */}
          <ul className="sidebar-nav-list" role="menubar">
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}`}
                className={`sidebar-nav-item ${pathname === `/cases/${activeCaseId}` ? 'active' : ''}`}
                role="menuitem"
                title="Case Overview"
              >
                <span className="nav-icon" aria-hidden="true">📋</span>
                {!isCollapsed && <span className="nav-label">Overview</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/assessment`}
                className={`sidebar-nav-item ${pathname.includes('/assessment') ? 'active' : ''}`}
                role="menuitem"
                title="Clinical Assessment & Baselines"
              >
                <span className="nav-icon" aria-hidden="true">🩺</span>
                {!isCollapsed && <span className="nav-label">Assessment</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/phenotype`}
                className={`sidebar-nav-item ${pathname.includes('/phenotype') ? 'active' : ''}`}
                role="menuitem"
                title="Phenotype Workspace"
              >
                <span className="nav-icon" aria-hidden="true">🧬</span>
                {!isCollapsed && <span className="nav-label">Phenotype</span>}
                {!isCollapsed && activeRecord?.phenotype.snapshotHash && (
                  <span className="badge badge-tier1 badge-tiny">Approved</span>
                )}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/imaging`}
                className={`sidebar-nav-item ${pathname.includes('/imaging') ? 'active' : ''}`}
                role="menuitem"
                title="Neuroimaging QC & Qualification"
              >
                <span className="nav-icon" aria-hidden="true">🧠</span>
                {!isCollapsed && <span className="nav-label">Imaging</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/connectome`}
                className={`sidebar-nav-item ${pathname.includes('/connectome') ? 'active' : ''}`}
                role="menuitem"
                title="Functional Connectome Qualification"
              >
                <span className="nav-icon" aria-hidden="true">🌐</span>
                {!isCollapsed && <span className="nav-label">Connectome</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/targets`}
                className={`sidebar-nav-item ${pathname.includes('/targets') ? 'active' : ''}`}
                role="menuitem"
                title="Target Slate Workspace"
              >
                <span className="nav-icon" aria-hidden="true">🎯</span>
                {!isCollapsed && <span className="nav-label">Target Slate</span>}
                {!isCollapsed && activeRecord?.isStale && (
                  <span className="badge badge-tier3 badge-tiny">Stale</span>
                )}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/compare`}
                className={`sidebar-nav-item ${pathname.includes('/compare') ? 'active' : ''}`}
                role="menuitem"
                title="Target Comparison Matrix"
              >
                <span className="nav-icon" aria-hidden="true">⚖️</span>
                {!isCollapsed && <span className="nav-label">Compare</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/decision`}
                className={`sidebar-nav-item ${pathname.includes('/decision') ? 'active' : ''}`}
                role="menuitem"
                title="Clinical Decision & Sign-Off"
              >
                <span className="nav-icon" aria-hidden="true">✍️</span>
                {!isCollapsed && <span className="nav-label">Decision</span>}
                {!isCollapsed && activeRecord?.decision?.isImmutable && (
                  <span className="badge badge-tier1 badge-tiny">Signed</span>
                )}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/treatment`}
                className={`sidebar-nav-item ${pathname.includes('/treatment') ? 'active' : ''}`}
                role="menuitem"
                title="TMS Treatment Prescription"
              >
                <span className="nav-icon" aria-hidden="true">⚡</span>
                {!isCollapsed && <span className="nav-label">Treatment</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/outcomes`}
                className={`sidebar-nav-item ${pathname.includes('/outcomes') ? 'active' : ''}`}
                role="menuitem"
                title="Clinical Outcomes & Response"
              >
                <span className="nav-icon" aria-hidden="true">📈</span>
                {!isCollapsed && <span className="nav-label">Outcomes</span>}
              </Link>
            </li>

            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/audit`}
                className={`sidebar-nav-item ${pathname.includes('/audit') ? 'active' : ''}`}
                role="menuitem"
                title="Cryptographic Audit History"
              >
                <span className="nav-icon" aria-hidden="true">🔒</span>
                {!isCollapsed && <span className="nav-label">Audit</span>}
              </Link>
            </li>
          </ul>
        </div>
      ) : (
        /* ========================================================================= */
        /* GLOBAL CLINICIAN NAVIGATION (Section 24, 32, 35)                         */
        /* ========================================================================= */
        <div className="global-navigation-group">
          {/* Section 1: Clinical Workspace */}
          <div className="sidebar-section">
            {!isCollapsed && <span className="sidebar-section-title">CLINICAL</span>}
            <ul className="sidebar-nav-list" role="menubar">
              <li role="none">
                <Link
                  href="/"
                  className={`sidebar-nav-item ${pathname === '/' ? 'active' : ''}`}
                  role="menuitem"
                  title="Clinician Home Worklist"
                >
                  <span className="nav-icon" aria-hidden="true">🏠</span>
                  {!isCollapsed && <span className="nav-label">Home</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/cases"
                  className={`sidebar-nav-item ${pathname === '/cases' ? 'active' : ''}`}
                  role="menuitem"
                  title="Clinical Cases Registry"
                >
                  <span className="nav-icon" aria-hidden="true">📁</span>
                  {!isCollapsed && <span className="nav-label">Cases</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/awaiting-review"
                  className={`sidebar-nav-item ${pathname === '/awaiting-review' ? 'active' : ''}`}
                  role="menuitem"
                  title="Cases Awaiting Clinician Review"
                >
                  <span className="nav-icon" aria-hidden="true">⏳</span>
                  {!isCollapsed && <span className="nav-label">Awaiting Review</span>}
                  <span className="badge badge-queue-count" title="3 cases require review">3</span>
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/decisions"
                  className={`sidebar-nav-item ${pathname === '/decisions' ? 'active' : ''}`}
                  role="menuitem"
                  title="Signed & Pending Clinical Decisions"
                >
                  <span className="nav-icon" aria-hidden="true">📜</span>
                  {!isCollapsed && <span className="nav-label">Decisions</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/evidence"
                  className={`sidebar-nav-item ${pathname === '/evidence' ? 'active' : ''}`}
                  role="menuitem"
                  title="Evidence Claims & Therapeutic Circuits Library"
                >
                  <span className="nav-icon" aria-hidden="true">📚</span>
                  {!isCollapsed && <span className="nav-label">Evidence</span>}
                </Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-divider" />

          {/* Section 2: Research Workspace (§32) */}
          <div className="sidebar-section">
            {!isCollapsed && <span className="sidebar-section-title">RESEARCH</span>}
            <ul className="sidebar-nav-list" role="menubar">
              <li role="none">
                <Link
                  href="/research"
                  className={`sidebar-nav-item ${pathname === '/research' ? 'active' : ''}`}
                  role="menuitem"
                  title="Research Exploratory Neuroimaging Workspace"
                >
                  <span className="nav-icon" aria-hidden="true">🔬</span>
                  {!isCollapsed && <span className="nav-label">Research</span>}
                </Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-divider" />

          {/* Section 3: System & Validation (§34, 120, 151) */}
          <div className="sidebar-section">
            {!isCollapsed && <span className="sidebar-section-title">GOVERNANCE</span>}
            <ul className="sidebar-nav-list" role="menubar">
              <li role="none">
                <Link
                  href="/validation"
                  className={`sidebar-nav-item ${pathname === '/validation' ? 'active' : ''}`}
                  role="menuitem"
                  title="Validation Suite (Golden Cases G01–G09 & Human Factors)"
                >
                  <span className="nav-icon" aria-hidden="true">🧪</span>
                  {!isCollapsed && <span className="nav-label">Validation Suite</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/help"
                  className={`sidebar-nav-item ${pathname === '/help' ? 'active' : ''}`}
                  role="menuitem"
                  title="Clinical & Scientific Guidance"
                >
                  <span className="nav-icon" aria-hidden="true">❓</span>
                  {!isCollapsed && <span className="nav-label">Help</span>}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
