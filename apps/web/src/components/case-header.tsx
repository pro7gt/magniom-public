'use client';

import React from 'react';
import type { EnvironmentMode } from '@magniom/presentation';

interface CaseHeaderProps {
  caseCode: string;
  patientDisplayLabel: string;
  indication: string;
  mode?: EnvironmentMode | undefined;
  caseState: string;
  isPhenotypeApproved?: boolean | undefined;
  isConnectomeQualified?: boolean | undefined;
  isSlateReady?: boolean | undefined;
  isDecisionSigned?: boolean | undefined;
  isStale?: boolean | undefined;
  staleReason?: string | undefined;
  onRefreshSlate?: (() => void) | undefined;
}

export function CaseHeader({
  caseCode,
  patientDisplayLabel,
  indication,
  mode = 'CLINICAL',
  caseState,
  isPhenotypeApproved = true,
  isConnectomeQualified = true,
  isSlateReady = true,
  isDecisionSigned = false,
  isStale = false,
  staleReason,
  onRefreshSlate,
}: CaseHeaderProps) {
  const isResearch = mode === 'RESEARCH';

  const stateLabels: Record<string, string> = {
    draft: 'Draft Formulation',
    phenotype_ready: 'Phenotype Formulation',
    phenotype_approved: 'Phenotype Approved',
    target_slate_ready: 'Target Planning & Slate Review',
    clinician_review: 'Clinical Decision Review',
    decision_signed: 'Target Decision Signed (Immutable)',
    superseded: 'Superseded',
  };

  const indicationFormatted =
    indication === 'MDD'
      ? 'Major Depressive Disorder ± Anxious Distress'
      : indication;

  return (
    <div className="case-status-header-wrapper" aria-label={`Clinical Context for Case ${caseCode}`}>
      {/* Persistent Case Status Header Bar (§41–50) */}
      <div className="case-status-header">
        <div className="case-header-primary">
          <div className="case-code-title-group">
            <span className="case-header-code" style={{ fontFamily: 'var(--font-mono)' }}>
              {caseCode}
            </span>
            <span className="case-header-separator" aria-hidden="true">•</span>
            <h1 className="case-header-indication">{indicationFormatted}</h1>
          </div>
          <div className="case-header-submeta">
            <span>Subject: <strong>{patientDisplayLabel}</strong></span>
            <span>•</span>
            <span>Active Task: <strong style={{ color: 'var(--accent-cyan)' }}>{stateLabels[caseState] || caseState}</strong></span>
          </div>
        </div>

        <div className="case-header-status-pills">
          {/* Phenotype Qualification Pill */}
          <span
            className={`badge ${isPhenotypeApproved ? 'badge-tier1' : 'badge-tier3'}`}
            title="Clinician-approved symptom domain formulation"
          >
            Phenotype: {isPhenotypeApproved ? 'Approved' : 'Pending Approval'}
          </span>

          {/* Connectome Qualification Pill */}
          <span
            className={`badge ${isConnectomeQualified ? 'badge-tier1' : 'badge-tier3'}`}
            title="Structural and resting-state BOLD acquisition quality"
          >
            Connectome: {isConnectomeQualified ? 'Qualified' : 'Low Reliability'}
          </span>

          {/* Target Slate Qualification Pill */}
          <span
            className={`badge ${isStale ? 'badge-tier3' : isSlateReady ? 'badge-tier1' : 'badge-neutral'}`}
            title="Candidate Target Slate readiness"
          >
            Target Slate: {isStale ? 'Stale' : isSlateReady ? 'Ready for Review' : 'Pending'}
          </span>

          {/* Decision Status Pill */}
          <span
            className={`badge ${isDecisionSigned ? 'badge-tier1' : 'badge-neutral'}`}
            title="Clinical decision attestation status"
          >
            Decision: {isDecisionSigned ? 'Signed & Locked' : 'Pending Review'}
          </span>

          {/* Mode Badge */}
          {isResearch ? (
            <span className="badge badge-tierexp" title="Hypothesis-generating experimental mode">
              RESEARCH MODE
            </span>
          ) : (
            <span className="badge badge-tier1" title="Authorised clinical mode">
              CLINICAL MODE
            </span>
          )}
        </div>
      </div>

      {/* Persistent Staleness Alert Banner (§48, §49, §107) */}
      {isStale && (
        <aside
          className="case-staleness-banner"
          role="alert"
          aria-label="Stale Target Slate Warning"
        >
          <div className="staleness-content">
            <span className="staleness-icon" aria-hidden="true">⚠</span>
            <div>
              <strong className="staleness-title">STALE TARGET SLATE DETECTED:</strong>{' '}
              <span className="staleness-message">
                {staleReason || 'The clinical phenotype was updated after this slate was computed. Clinical sign-off is blocked until slate is regenerated.'}
              </span>
            </div>
          </div>
          {onRefreshSlate && (
            <button
              onClick={onRefreshSlate}
              className="btn btn-regenerate-slate"
              id="regenerate-stale-slate-btn"
            >
              Regenerate Current Slate ↺
            </button>
          )}
        </aside>
      )}

      {/* Research Mode Restriction Notice (§46, §139) */}
      {isResearch && (
        <aside className="case-research-notice" role="alert">
          <strong>RESEARCH CASE CONTEXT:</strong> All candidate targets and connectivity maps in this case are hypothesis-generating and for exploratory analysis. Clinical decision sign-off is disabled.
        </aside>
      )}
    </div>
  );
}
