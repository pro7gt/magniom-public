'use client';

import React, { useState } from 'react';
import type {
  CaseShellViewModel,
  EnvironmentMode,
  IndicationOptionViewModel,
  ClinicalObjectiveSummaryViewModel,
  DiseaseStageSummaryViewModel,
  LesionContextSummaryViewModel,
  TreatmentContextSummaryViewModel,
  ModuleAuthorityViewModel,
  CurrentnessViewModel,
  MeasurementSummaryViewModel,
} from '@magniom/presentation';

interface CaseHeaderProps {
  caseCode: string;
  patientDisplayLabel: string;
  indication: string;
  mode?: EnvironmentMode | undefined;
  caseState?: string | undefined;
  shellVm?: CaseShellViewModel | undefined;
  availableIndications?: readonly IndicationOptionViewModel[] | undefined;
  onSwitchIndication?: ((caseIndicationId: string) => void) | undefined;
  clinicalObjective?: ClinicalObjectiveSummaryViewModel | undefined;
  diseaseStage?: DiseaseStageSummaryViewModel | undefined;
  lesionContext?: LesionContextSummaryViewModel | undefined;
  treatmentContext?: TreatmentContextSummaryViewModel | undefined;
  moduleAuthority?: ModuleAuthorityViewModel | undefined;
  currentness?: CurrentnessViewModel | undefined;
  measurements?: readonly MeasurementSummaryViewModel[] | undefined;
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
  caseState = 'target_slate_ready',
  shellVm,
  availableIndications,
  onSwitchIndication,
  clinicalObjective,
  diseaseStage,
  lesionContext,
  treatmentContext,
  moduleAuthority,
  currentness,
  measurements,
  isPhenotypeApproved = true,
  isConnectomeQualified = true,
  isSlateReady = true,
  isDecisionSigned = false,
  isStale = false,
  staleReason,
  onRefreshSlate,
}: CaseHeaderProps) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [pendingSwitchIndication, setPendingSwitchIndication] =
    useState<IndicationOptionViewModel | null>(null);

  // Extract from shellVm if provided, otherwise fallback to direct props
  const effectiveMode = shellVm?.mode.mode || mode;
  const isResearch = effectiveMode === 'RESEARCH';

  const activeIndicationCode = shellVm?.indication.indicationCode || indication;
  const activeIndicationFormatted =
    shellVm?.indication.indicationFormatted ||
    (activeIndicationCode === 'MDD'
      ? 'Major Depressive Disorder ± Anxious Distress'
      : activeIndicationCode === 'PAIN'
        ? 'Intractable Neuropathic Pain'
        : activeIndicationCode === 'STROKE_MOTOR'
          ? 'Post-Stroke Motor Recovery'
          : activeIndicationCode === 'STROKE_APHASIA'
            ? 'Post-Stroke Expressive Aphasia'
            : activeIndicationCode === 'OCD'
              ? 'Obsessive-Compulsive Disorder (Deep TMS)'
              : activeIndicationCode === 'TINNITUS'
                ? 'Subjective Refractory Tinnitus (Research)'
                : activeIndicationCode === 'TBI'
                  ? 'Chronic Traumatic Brain Injury (Research)'
                  : activeIndicationCode === 'SUD'
                    ? 'Substance Use Disorders'
                    : activeIndicationCode);

  const indicationsList = shellVm?.indication.allAvailableIndications || availableIndications || [];

  const effectiveObjective = shellVm?.indication.clinicalObjective || clinicalObjective;
  const effectiveStage = shellVm?.indication.diseaseStage || diseaseStage;
  const effectiveLesion = shellVm?.indication.lesionContext || lesionContext;
  const effectiveTreatment = shellVm?.indication.treatmentContext || treatmentContext;
  const effectiveAuthority = shellVm?.moduleAuthority || moduleAuthority;
  const effectiveCurrentness = shellVm?.currentness || currentness;
  const effectiveMeasurements = shellVm?.measurements || measurements;

  const effectiveIsStale = effectiveCurrentness ? effectiveCurrentness.isStale : isStale;
  const effectiveStaleReason = effectiveCurrentness?.reasons[0]?.message || staleReason;
  const isBlockingStale = Boolean(effectiveCurrentness?.blockingSignOff);

  const stateLabels: Record<string, string> = {
    draft: 'Draft Formulation',
    phenotype_ready: 'Phenotype Formulation',
    phenotype_approved: 'Phenotype Approved',
    target_slate_ready: 'Target Planning & Slate Review',
    clinician_review: 'Clinical Decision Review',
    decision_signed: 'Target Decision Signed (Immutable)',
    superseded: 'Superseded',
  };

  return (
    <div
      className="case-status-header-wrapper"
      aria-label={`Clinical Context for Case ${caseCode}`}
    >
      {/* 1. Main Persistent Header Bar (§58–60) */}
      <div className="case-status-header">
        <div className="case-header-primary">
          <div
            className="case-code-title-group"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span
              className="case-header-code"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700 }}
            >
              {caseCode}
            </span>
            <span
              className="case-header-separator"
              aria-hidden="true"
              style={{ color: 'var(--text-muted)' }}
            >
              •
            </span>

            {/* Principal CaseIndication & Switcher Dropdown (§63–66) */}
            <div
              className="case-indication-container"
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            >
              <h1 className="case-header-indication" style={{ margin: 0, fontSize: '1.25rem' }}>
                {activeIndicationFormatted}
              </h1>

              {indicationsList.length > 1 && (
                <div style={{ position: 'relative', marginLeft: '8px' }}>
                  <button
                    className="indication-switcher-btn"
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    aria-expanded={isSwitcherOpen}
                    aria-label="Switch targeting indication"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'var(--text-main)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Switch Indication ▾
                  </button>

                  {isSwitcherOpen && (
                    <div
                      className="indication-dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 100,
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                        minWidth: '280px',
                        marginTop: '4px',
                        padding: '6px 0',
                      }}
                    >
                      <div
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                        }}
                      >
                        Patient Case Indications
                      </div>
                      {indicationsList.map(ind => (
                        <button
                          key={ind.caseIndicationId}
                          onClick={() => {
                            setIsSwitcherOpen(false);
                            if (ind.indicationCode !== activeIndicationCode) {
                              setPendingSwitchIndication(ind);
                            }
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            background:
                              ind.indicationCode === activeIndicationCode
                                ? '#374151'
                                : 'transparent',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{ind.label}</span>
                          {ind.isPrimary && (
                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                              Primary
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submeta: Patient display label + Task status + Indication Module Disclosure (§68–69) */}
          <div
            className="case-header-submeta"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              marginTop: '4px',
            }}
          >
            <span>
              Subject: <strong>{patientDisplayLabel}</strong>
            </span>
            <span>•</span>
            <span>
              Active Task:{' '}
              <strong style={{ color: 'var(--accent-cyan)' }}>
                {stateLabels[caseState] || caseState}
              </strong>
            </span>

            {/* Governing Indication Module Release Disclosure (§68–69) */}
            {effectiveAuthority && (
              <>
                <span>•</span>
                <span title={`Release ID: ${effectiveAuthority.moduleReleaseId}`}>
                  Module: <strong>{effectiveAuthority.humanReadableName}</strong>{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    ({effectiveAuthority.moduleVersion})
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Pills and Module Qualification (§24, §71, §97–99) */}
        <div
          className="case-header-status-pills"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}
        >
          {/* Module Qualification Badge (§24, §70–71) */}
          {effectiveAuthority && (
            <span
              className={`badge ${
                effectiveAuthority.isClinicalAuthorised
                  ? 'badge-tier1'
                  : effectiveAuthority.isValidationOnly
                    ? 'badge-tier2'
                    : 'badge-tierexp'
              }`}
              title={`Module Qualification: ${effectiveAuthority.qualificationLevel}`}
            >
              {effectiveAuthority.permissionLabel}
            </span>
          )}

          {/* Dynamic Modality Pills (§97–99) */}
          {effectiveMeasurements && effectiveMeasurements.length > 0 ? (
            effectiveMeasurements.slice(0, 3).map(m => (
              <span
                key={m.modality}
                className={`badge ${m.badgeClass}`}
                title={m.reliabilitySummary || m.modalityLabel}
              >
                {m.modalityLabel.split(' ')[0]}:{' '}
                {m.qualification === 'qualified' ? '✓' : m.qualification}
              </span>
            ))
          ) : (
            <>
              {/* Backward compatibility default pills */}
              <span
                className={`badge ${isPhenotypeApproved ? 'badge-tier1' : 'badge-tier3'}`}
                title="Clinician-approved symptom domain formulation"
              >
                Phenotype: {isPhenotypeApproved ? 'Approved' : 'Pending Approval'}
              </span>
              <span
                className={`badge ${isConnectomeQualified ? 'badge-tier1' : 'badge-tier3'}`}
                title="Structural and resting-state BOLD acquisition quality"
              >
                Connectome: {isConnectomeQualified ? 'Qualified' : 'Low Reliability'}
              </span>
            </>
          )}

          {/* Target Slate Status Pill */}
          <span
            className={`badge ${effectiveIsStale ? (isBlockingStale ? 'badge-tier3' : 'badge-tierexp') : isSlateReady ? 'badge-tier1' : 'badge-neutral'}`}
            title="Candidate Target Slate readiness"
          >
            Target Slate:{' '}
            {effectiveIsStale ? 'Stale' : isSlateReady ? 'Ready for Review' : 'Pending'}
          </span>

          {/* Decision Status Pill */}
          <span
            className={`badge ${isDecisionSigned ? 'badge-tier1' : 'badge-neutral'}`}
            title="Clinical decision attestation status"
          >
            Decision: {isDecisionSigned ? 'Signed & Locked' : 'Pending Review'}
          </span>
        </div>
      </div>

      {/* 2. Clinical Context Strip: Objective, Stage, Lesion, Treatment (§72–75) */}
      {(effectiveObjective || effectiveStage || effectiveLesion || effectiveTreatment) && (
        <div
          className="case-header-context-strip"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '6px 16px',
            fontSize: '0.85rem',
            alignItems: 'center',
          }}
        >
          {/* Clinical Objective (§72) */}
          {effectiveObjective && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Objective:</span>
              <span style={{ color: 'var(--text-main)' }}>{effectiveObjective.title}</span>
            </div>
          )}

          {/* Disease Stage (§73) */}
          {effectiveStage && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Stage:</span>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                {effectiveStage.stageLabel}
              </span>
            </div>
          )}

          {/* Lesion Context (§74) */}
          {effectiveLesion && effectiveLesion.hasLesion && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Lesion:</span>
              <span
                className={`badge ${effectiveLesion.hasTargetOverlapWarning ? 'badge-tier3' : 'badge-neutral'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {effectiveLesion.laterality ? `${effectiveLesion.laterality.toUpperCase()} ` : ''}
                {effectiveLesion.lesionType || 'Reviewed'}
                {effectiveLesion.hasTargetOverlapWarning && ' ⚠ Overlap Warning'}
              </span>
            </div>
          )}

          {/* Treatment Context (§75) */}
          {effectiveTreatment && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Treatment:</span>
              <span style={{ color: 'var(--text-main)' }}>{effectiveTreatment.statusLabel}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. 3-Tier Staleness Alert Banner (§76–80) */}
      {effectiveIsStale && (
        <aside
          className={`case-staleness-banner ${isBlockingStale ? 'blocking-staleness' : 'important-staleness'}`}
          role="alert"
          aria-label="Stale Target Slate Warning"
          style={{
            backgroundColor: isBlockingStale ? '#4a1114' : '#3d2800',
            borderBottom: `2px solid ${isBlockingStale ? '#e53e3e' : '#d69e2e'}`,
            padding: '10px 16px',
            color: isBlockingStale ? '#ffdddd' : '#fefcbf',
          }}
        >
          <div
            className="staleness-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="staleness-icon" aria-hidden="true" style={{ fontSize: '1.2rem' }}>
                {isBlockingStale ? '🛑' : '⚠'}
              </span>
              <div>
                <strong
                  className="staleness-title"
                  style={{ color: isBlockingStale ? '#fc8181' : '#faf089' }}
                >
                  {isBlockingStale ? 'BLOCKING STALENESS DETECTED:' : 'IMPORTANT NOTICE:'}
                </strong>{' '}
                <span className="staleness-message">{effectiveStaleReason}</span>
                {isBlockingStale && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: '#fc8181',
                      marginTop: '2px',
                    }}
                  >
                    Clinical decision signing is locked until the Target Slate is regenerated with
                    current parameters.
                  </span>
                )}
              </div>
            </div>
            {onRefreshSlate && (
              <button
                onClick={onRefreshSlate}
                className="btn btn-regenerate-slate"
                id="regenerate-stale-slate-btn"
                style={{
                  backgroundColor: isBlockingStale ? '#e53e3e' : '#d69e2e',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Regenerate Slate ↺
              </button>
            )}
          </div>
        </aside>
      )}

      {/* 4. Research Mode Notice (§22, §139) */}
      {isResearch && (
        <aside
          className="case-research-notice"
          role="alert"
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <strong>RESEARCH PROTOTYPE CONTEXT:</strong> All candidate targets in this case are
          hypothesis-generating. Clinical decision sign-off is disabled.
        </aside>
      )}

      {/* 5. Indication Switch Confirmation Dialog (§66) */}
      {pendingSwitchIndication && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-indication-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 id="switch-indication-dialog-title" style={{ marginTop: 0, color: '#fff' }}>
              Switch Clinical Indication Context?
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Switching from <strong>{activeIndicationFormatted}</strong> to{' '}
              <strong>{pendingSwitchIndication.label}</strong> will load an independent targeting
              workflow, re-evaluate evidence boundaries, and isolate any existing Target Slate
              (§66–67).
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setPendingSwitchIndication(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#374151',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetInd = pendingSwitchIndication;
                  setPendingSwitchIndication(null);
                  if (onSwitchIndication) {
                    onSwitchIndication(targetInd.caseIndicationId);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Confirm & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
