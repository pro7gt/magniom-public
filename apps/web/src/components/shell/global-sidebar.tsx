'use client';

import {
  Button,
  Badge,
  Icon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FileTextIcon,
  DnaIcon,
  ActivityIcon,
  AlertTriangleIcon,
  ClockIcon,
  BarChart3Icon,
  MicroscopeIcon,
  BrainIcon,
  BookOpenIcon,
  TargetIcon,
  ScaleIcon,
  LockIcon,
  FlaskConicalIcon,
  SettingsIcon,
} from '@/components/ui';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { caseStore } from '../../lib/case-store';
import { getModuleUiDescriptor } from '@magniom/presentation';

interface GlobalSidebarProps {
  initialCollapsed?: boolean;
}

export function GlobalSidebar({ initialCollapsed = false }: GlobalSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  // Extract caseId if inside /cases/[caseId], /research/cases/[caseId], or /validation/cases/[caseId] route
  const caseMatch = pathname.match(/^(?:\/research|\/validation)?\/cases\/([^/]+)/);
  const activeCaseId = caseMatch ? caseMatch[1] : undefined;
  const isCaseWorkspace = Boolean(activeCaseId && activeCaseId !== 'new');

  const activeRecord = activeCaseId ? caseStore.getCaseRecord(activeCaseId) : undefined;
  const activeCaseCode = activeRecord?.clinicalCase.caseCode || activeCaseId;
  const activeIndication = activeRecord?.clinicalCase.indicationCode || 'MDD';

  const descriptor = getModuleUiDescriptor(activeIndication);
  const isResearchMode =
    activeRecord?.clinicalCase.mode === 'RESEARCH' ||
    descriptor.indication_code === 'TINNITUS' ||
    descriptor.indication_code === 'TBI';

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
      aria-label={
        isCaseWorkspace ? `Case Navigation for ${activeCaseCode}` : 'Global Application Navigation'
      }
    >
      {/* Sidebar Collapse/Expand Toggle Button */}
      <div className="sidebar-header-toggle">
        <Button
          variant="ghost"
          size="sm"
          className="sidebar-toggle-btn"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRightIcon size={14} /> : <ChevronLeftIcon size={14} />}
        </Button>
      </div>

      {isCaseWorkspace ? (
        /* ========================================================================= */
        /* MODULE-AWARE CASE WORKSPACE NAVIGATION (§50–57, §231–233)                */
        /* ========================================================================= */
        <div className="case-navigation-group">
          {/* Back to All Cases link (§50) */}
          <Link
            href="/cases"
            className="sidebar-back-link"
            title="Return to Clinical Case Registry"
          >
            <span className="back-icon" aria-hidden="true">
              <Icon name="arrow-left" size={14} />
            </span>
            {!isCollapsed && <span className="back-text">All Cases</span>}
          </Link>

          {/* Active Case Context Chip */}
          <div className="sidebar-case-identity">
            <Badge variant="neutral" mono className="case-badge-pill">
              {isCollapsed ? activeCaseCode?.slice(-4) : activeCaseCode}
            </Badge>
            {!isCollapsed && (
              <span className="case-indication-sub" title={descriptor.indication_name}>
                {descriptor.indication_code}
              </span>
            )}
          </div>

          <div className="sidebar-divider" />

          {/* Dynamic Module-Aware Case Navigation Items */}
          <ul className="sidebar-nav-list" role="menubar">
            {/* 1. Overview */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}`}
                className={`sidebar-nav-item ${pathname === `/cases/${activeCaseId}` ? 'active' : ''}`}
                role="menuitem"
                title="Case Overview"
              >
                <span className="nav-icon" aria-hidden="true">
                  <FileTextIcon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Overview</span>}
              </Link>
            </li>

            {/* 1b. Clinical Context (§93) */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/context`}
                className={`sidebar-nav-item ${pathname.includes('/context') ? 'active' : ''}`}
                role="menuitem"
                title="Clinical Context Formulation"
              >
                <span className="nav-icon" aria-hidden="true">
                  <DnaIcon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Context</span>}
              </Link>
            </li>

            {/* 2. Assessment */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/assessment`}
                className={`sidebar-nav-item ${pathname.includes('/assessment') ? 'active' : ''}`}
                role="menuitem"
                title="Clinical Assessment & Baselines"
              >
                <span className="nav-icon" aria-hidden="true">
                  <ActivityIcon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Assessment</span>}
              </Link>
            </li>

            {/* 3. Module Context Sections (e.g. Phenotype, Somatotopy, Lesion, Stage) */}
            {descriptor.context_sections.map(cs => {
              const href = `/cases/${activeCaseId}/${cs.pathSuffix}`;
              const isActive = pathname.includes(cs.pathSuffix);
              return (
                <li role="none" key={cs.id}>
                  <Link
                    href={href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    role="menuitem"
                    title={cs.label}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {cs.id.includes('lesion') ? (
                        <AlertTriangleIcon size={16} />
                      ) : cs.id.includes('stage') ? (
                        <ClockIcon size={16} />
                      ) : cs.id.includes('pain') ? (
                        <ActivityIcon size={16} />
                      ) : (
                        <DnaIcon size={16} />
                      )}
                    </span>
                    {!isCollapsed && <span className="nav-label">{cs.label.split(' ')[0]}</span>}
                  </Link>
                </li>
              );
            })}

            {/* 4. Module Measurements Overview (§96–100) */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/measurements`}
                className={`sidebar-nav-item ${pathname.includes('/measurements') ? 'active' : ''}`}
                role="menuitem"
                title="Measurement Summary & Modality Qualifications"
              >
                <span className="nav-icon" aria-hidden="true">
                  <BarChart3Icon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Measurements</span>}
              </Link>
            </li>

            {/* 4b. Module Specific Modality Sub-Sections */}
            {descriptor.measurement_sections.map(ms => {
              const href = `/cases/${activeCaseId}/${ms.pathSuffix}`;
              const isActive = pathname.includes(ms.pathSuffix);
              return (
                <li role="none" key={ms.modality}>
                  <Link
                    href={href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    role="menuitem"
                    title={ms.label}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {ms.modality === 'audiology' ? (
                        <Icon name="ear" size={16} />
                      ) : ms.modality === 'motor_mapping' ||
                        ms.modality === 'motor_evoked_potential' ? (
                        <Icon name="hand" size={16} />
                      ) : ms.modality === 'efield' ? (
                        <Icon name="magnet" size={16} />
                      ) : ms.modality === 'lesion_mapping' ? (
                        <MicroscopeIcon size={16} />
                      ) : (
                        <BrainIcon size={16} />
                      )}
                    </span>
                    {!isCollapsed && <span className="nav-label">{ms.label.split(' ')[0]}</span>}
                    {!isCollapsed && !ms.required && (
                      <Badge variant="tierexp" size="sm">
                        Research
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* 5. Evidence */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/evidence`}
                className={`sidebar-nav-item ${pathname.includes('/evidence') ? 'active' : ''}`}
                role="menuitem"
                title="Therapeutic Evidence & Circuit Library"
              >
                <span className="nav-icon" aria-hidden="true">
                  <BookOpenIcon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Evidence</span>}
              </Link>
            </li>

            {/* 6. Target Slate Workspace */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/targets`}
                className={`sidebar-nav-item ${pathname.includes('/targets') ? 'active' : ''}`}
                role="menuitem"
                title={isResearchMode ? 'Research Target Hypotheses' : 'Target Slate Workspace'}
              >
                <span className="nav-icon" aria-hidden="true">
                  <TargetIcon size={16} />
                </span>
                {!isCollapsed && (
                  <span className="nav-label">
                    {isResearchMode ? 'Hypotheses' : 'Target Slate'}
                  </span>
                )}
                {!isCollapsed && activeRecord?.isStale && (
                  <Badge variant="tier3" size="sm">
                    Stale
                  </Badge>
                )}
              </Link>
            </li>

            {/* 7. Compare */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/compare`}
                className={`sidebar-nav-item ${pathname.includes('/compare') ? 'active' : ''}`}
                role="menuitem"
                title="Target Comparison Matrix"
              >
                <span className="nav-icon" aria-hidden="true">
                  <ScaleIcon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Compare</span>}
              </Link>
            </li>

            {/* 8. Clinical Decision & Sign-Off (STRICTLY SUPPRESSED IN RESEARCH MODE (§57, §139)) */}
            {!isResearchMode && (
              <li role="none">
                <Link
                  href={`/cases/${activeCaseId}/decision`}
                  className={`sidebar-nav-item ${pathname.includes('/decision') ? 'active' : ''}`}
                  role="menuitem"
                  title="Clinical Decision & Sign-Off"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <FileTextIcon size={16} />
                  </span>
                  {!isCollapsed && <span className="nav-label">Decision</span>}
                  {!isCollapsed && activeRecord?.decision?.isImmutable && (
                    <Badge variant="tier1" size="sm">
                      Signed
                    </Badge>
                  )}
                </Link>
              </li>
            )}

            {/* 9. Treatment (Suppressed in Research Mode) */}
            {!isResearchMode && (
              <li role="none">
                <Link
                  href={`/cases/${activeCaseId}/treatment`}
                  className={`sidebar-nav-item ${pathname.includes('/treatment') ? 'active' : ''}`}
                  role="menuitem"
                  title="TMS Treatment Prescription"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <ActivityIcon size={16} />
                  </span>
                  {!isCollapsed && <span className="nav-label">Treatment</span>}
                </Link>
              </li>
            )}

            {/* 10. Outcomes */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/outcomes`}
                className={`sidebar-nav-item ${pathname.includes('/outcomes') ? 'active' : ''}`}
                role="menuitem"
                title="Clinical Outcomes & Response"
              >
                <span className="nav-icon" aria-hidden="true">
                  <BarChart3Icon size={16} />
                </span>
                {!isCollapsed && <span className="nav-label">Outcomes</span>}
              </Link>
            </li>

            {/* 11. Cryptographic Audit */}
            <li role="none">
              <Link
                href={`/cases/${activeCaseId}/audit`}
                className={`sidebar-nav-item ${pathname.includes('/audit') ? 'active' : ''}`}
                role="menuitem"
                title="Cryptographic Audit History"
              >
                <span className="nav-icon" aria-hidden="true">
                  <LockIcon size={16} />
                </span>
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
                  <span className="nav-icon" aria-hidden="true">
                    <Icon name="home" size={16} />
                  </span>
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
                  <span className="nav-icon" aria-hidden="true">
                    <Icon name="folder" size={16} />
                  </span>
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
                  <span className="nav-icon" aria-hidden="true">
                    <ClockIcon size={16} />
                  </span>
                  {!isCollapsed && <span className="nav-label">Awaiting Review</span>}
                  <Badge
                    variant="neutral"
                    className="badge-queue-count"
                    title="Cases require review"
                  >
                    3
                  </Badge>
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/decisions"
                  className={`sidebar-nav-item ${pathname === '/decisions' ? 'active' : ''}`}
                  role="menuitem"
                  title="Signed & Pending Clinical Decisions"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <FileTextIcon size={16} />
                  </span>
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
                  <span className="nav-icon" aria-hidden="true">
                    <BookOpenIcon size={16} />
                  </span>
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
                  <span className="nav-icon" aria-hidden="true">
                    <MicroscopeIcon size={16} />
                  </span>
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
                  title="Validation Suite (Golden Cases & Human Factors)"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <FlaskConicalIcon size={16} />
                  </span>
                  {!isCollapsed && <span className="nav-label">Validation Suite</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/internal/verification"
                  className={`sidebar-nav-item ${pathname.includes('/internal/verification') ? 'active' : ''}`}
                  role="menuitem"
                  title="Formal Shell Verification & Q-Level Matrix (§45–46)"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <MicroscopeIcon size={16} />
                  </span>
                  {!isCollapsed && <span className="nav-label">Verification</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/admin"
                  className={`sidebar-nav-item ${pathname === '/admin' ? 'active' : ''}`}
                  role="menuitem"
                  title="System Administration & Policies (§44)"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <SettingsIcon size={16} />
                  </span>
                  {!isCollapsed && <span className="nav-label">Admin</span>}
                </Link>
              </li>

              <li role="none">
                <Link
                  href="/help"
                  className={`sidebar-nav-item ${pathname === '/help' ? 'active' : ''}`}
                  role="menuitem"
                  title="Clinical & Scientific Guidance"
                >
                  <span className="nav-icon" aria-hidden="true">
                    <BookOpenIcon size={16} />
                  </span>
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
