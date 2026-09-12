'use client';

import {
  Button,
  Badge,
  Modal,
  ChevronDownIcon,
  CheckIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  RefreshCwIcon,
} from '@/components/ui';

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
  connectomeQualification?: string | undefined;
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
  connectomeQualification,
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
          <div className="case-code-title-group flex items-center gap-2">
            <span className="case-header-code font-mono text-lg font-bold">{caseCode}</span>
            <span className="case-header-separator text-muted" aria-hidden="true">
              •
            </span>

            {/* Principal CaseIndication & Switcher Dropdown (§63–66) */}
            <div className="case-indication-container relative inline-flex items-center">
              <span className="case-header-indication m-0 text-xl font-bold">
                {activeIndicationFormatted}
              </span>

              {indicationsList.length > 1 && (
                <div className="relative ml-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="indication-switcher-btn inline-flex items-center gap-1 text-xs px-2 py-0.5"
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    aria-expanded={isSwitcherOpen}
                    aria-label="Switch targeting indication"
                  >
                    Switch Indication <ChevronDownIcon size={12} />
                  </Button>

                  {isSwitcherOpen && (
                    <div className="indication-dropdown-menu">
                      <div className="px-3 py-1 text-xs text-secondary uppercase">
                        Patient Case Indications
                      </div>
                      {indicationsList.map(ind => (
                        <Button
                          key={ind.caseIndicationId}
                          variant="ghost"
                          onClick={() => {
                            setIsSwitcherOpen(false);
                            if (ind.indicationCode !== activeIndicationCode) {
                              setPendingSwitchIndication(ind);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 flex justify-between items-center text-sm ${
                            ind.indicationCode === activeIndicationCode ? 'bg-surface-elevated' : ''
                          }`}
                        >
                          <span>{ind.label}</span>
                          {ind.isPrimary && (
                            <Badge variant="neutral" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submeta: Patient display label + Task status + Indication Module Disclosure (§68–69) */}
          <div className="case-header-submeta flex flex-wrap gap-2 items-center mt-1">
            <span>
              Subject: <strong>{patientDisplayLabel}</strong>
            </span>
            <span>•</span>
            <span>
              Active Task:{' '}
              <strong className="text-cyan">{stateLabels[caseState] || caseState}</strong>
            </span>

            {/* Governing Indication Module Release Disclosure (§68–69) */}
            {effectiveAuthority && (
              <>
                <span>•</span>
                <span title={`Release ID: ${effectiveAuthority.moduleReleaseId}`}>
                  Module: <strong>{effectiveAuthority.humanReadableName}</strong>{' '}
                  <span className="font-mono text-xs text-muted">
                    ({effectiveAuthority.moduleVersion})
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Pills and Module Qualification (§24, §71, §97–99) */}
        <div className="case-header-status-pills flex flex-wrap gap-1.5 items-center">
          {/* Module Qualification Badge (§24, §70–71) */}
          {effectiveAuthority && (
            <Badge
              className={`${
                effectiveAuthority.isClinicalAuthorised
                  ? 'badge-tier1'
                  : effectiveAuthority.isValidationOnly
                    ? 'badge-tier2'
                    : 'badge-tierexp'
              }`}
              title={`Module Qualification: ${effectiveAuthority.qualificationLevel}`}
            >
              {effectiveAuthority.permissionLabel}
            </Badge>
          )}

          {/* Dynamic Modality Pills (§97–99) */}
          {effectiveMeasurements && effectiveMeasurements.length > 0 ? (
            effectiveMeasurements.slice(0, 3).map(m => (
              <Badge
                className={`${m.badgeClass}`}
                key={m.modality}

                title={m.reliabilitySummary || m.modalityLabel}
              >
                {m.modalityLabel.split(' ')[0]}:{' '}
                {m.qualification === 'qualified' ? (
                  <CheckIcon size={12} className="inline-block" />
                ) : (
                  m.qualification
                )}
              </Badge>
            ))
          ) : (
            <>
              {/* Backward compatibility default pills */}
              <Badge
                className={`${isPhenotypeApproved ? 'badge-tier1' : 'badge-tier3'}`}
                title="Clinician-approved symptom domain formulation"
              >
                Phenotype: {isPhenotypeApproved ? 'Approved' : 'Pending Approval'}
              </Badge>
              <Badge
                className={`${
                  connectomeQualification === 'qualified' || isConnectomeQualified
                    ? 'badge-tier1'
                    : connectomeQualification === 'limited'
                      ? 'badge-tier2'
                      : connectomeQualification === 'ineligible'
                        ? 'badge-tier3'
                        : 'badge-neutral'
                }`}
                title="Structural and resting-state BOLD acquisition quality"
              >
                Connectome:{' '}
                {connectomeQualification === 'qualified' || isConnectomeQualified
                  ? 'Qualified'
                  : connectomeQualification === 'limited'
                    ? 'Limited'
                    : connectomeQualification === 'ineligible'
                      ? 'Low Reliability'
                      : 'Not Acquired'}
              </Badge>
            </>
          )}

          {/* Target Slate Status Pill (§222: Silent study header shows only processing status without candidate info) */}
          {effectiveAuthority?.silentProspectiveBlinded ? (
            <Badge
              variant="neutral"
              title="Silent prospective study protocol — results blinded to treating clinician (§221–222)"
            >
              MAGNIOM study processing · Complete
            </Badge>
          ) : (
            <Badge
              className={`${effectiveIsStale ? (isBlockingStale ? 'badge-tier3' : 'badge-tierexp') : isSlateReady ? 'badge-tier1' : 'badge-neutral'}`}
              title="Candidate Target Slate readiness"
            >
              Target Slate:{' '}
              {effectiveIsStale ? 'Stale' : isSlateReady ? 'Ready for Review' : 'Pending'}
            </Badge>
          )}

          {/* Decision Status Pill */}
          <Badge
            className={`${isDecisionSigned ? 'badge-tier1' : 'badge-neutral'}`}
            title="Clinical decision attestation status"
          >
            Decision: {isDecisionSigned ? 'Signed & Locked' : 'Pending Review'}
          </Badge>
        </div>
      </div>

      {/* 2. Clinical Context Strip: Objective, Stage, Lesion, Treatment (§72–75) */}
      {(effectiveObjective || effectiveStage || effectiveLesion || effectiveTreatment) && (
        <div className="case-header-context-strip">
          {/* Clinical Objective (§72) */}
          {effectiveObjective && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-muted font-semibold">Objective:</span>
              <span className="text-primary">{effectiveObjective.title}</span>
            </div>
          )}

          {/* Disease Stage (§73) */}
          {effectiveStage && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-muted font-semibold">Stage:</span>
              <Badge variant="neutral" className="text-xs">
                {effectiveStage.stageLabel}
              </Badge>
            </div>
          )}

          {/* Lesion Context (§74) */}
          {effectiveLesion && effectiveLesion.hasLesion && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-muted font-semibold">Lesion:</span>
              <Badge
                className={`${effectiveLesion.hasTargetOverlapWarning ? 'badge-tier3' : 'badge-neutral'} text-xs`}
              >
                {effectiveLesion.laterality ? `${effectiveLesion.laterality.toUpperCase()} ` : ''}
                {effectiveLesion.lesionType || 'Reviewed'}
                {effectiveLesion.hasTargetOverlapWarning && (
                  <>
                    {' '}
                    <AlertTriangleIcon size={12} className="inline-block" /> Overlap Warning
                  </>
                )}
              </Badge>
            </div>
          )}

          {/* Treatment Context (§75) */}
          {effectiveTreatment && (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-muted font-semibold">Treatment:</span>
              <span className="text-primary">{effectiveTreatment.statusLabel}</span>
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
        >
          <div className="staleness-content flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="staleness-icon" aria-hidden="true">
                {isBlockingStale ? (
                  <AlertOctagonIcon size={20} className="text-rose" />
                ) : (
                  <AlertTriangleIcon size={20} className="text-amber" />
                )}
              </span>
              <div>
                <strong
                  className={`staleness-title ${isBlockingStale ? 'text-rose' : 'text-amber'}`}
                >
                  {isBlockingStale ? 'BLOCKING STALENESS DETECTED:' : 'IMPORTANT NOTICE:'}
                </strong>{' '}
                <span className="staleness-message">{effectiveStaleReason}</span>
                {isBlockingStale && (
                  <span className="block text-xs text-rose mt-0.5">
                    Clinical decision signing is locked until the Target Slate is regenerated with
                    current parameters.
                  </span>
                )}
              </div>
            </div>
            {onRefreshSlate && (
              <Button
                variant={isBlockingStale ? 'danger' : 'secondary'}
                className="btn-regenerate-slate inline-flex items-center gap-1.5 font-semibold text-sm px-3.5 py-1.5 rounded"
                onClick={onRefreshSlate}
                id="regenerate-stale-slate-btn"
              >
                <RefreshCwIcon size={14} /> Regenerate Slate
              </Button>
            )}
          </div>
        </aside>
      )}

      {/* 4. Research Mode Notice (§22, §139) */}
      {isResearch && (
        <aside className="case-research-notice px-4 py-1.5 text-sm" role="alert">
          <strong>RESEARCH PROTOTYPE CONTEXT:</strong> All candidate targets in this case are
          hypothesis-generating. Clinical decision sign-off is disabled.
        </aside>
      )}

      {/* 5. Indication Switch Confirmation Dialog (§66) */}
      <Modal
        isOpen={Boolean(pendingSwitchIndication)}
        onClose={() => setPendingSwitchIndication(null)}
        title="Switch Clinical Indication Context?"
        maxWidth="480px"
      >
        <p className="text-secondary text-sm leading-normal">
          Switching from <strong>{activeIndicationFormatted}</strong> to{' '}
          <strong>{pendingSwitchIndication?.label}</strong> will load an independent targeting
          workflow, re-evaluate evidence boundaries, and isolate any existing Target Slate (§66–67).
        </p>
        <div className="flex justify-end gap-2.5 mt-5">
          <Button variant="secondary" onClick={() => setPendingSwitchIndication(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const targetInd = pendingSwitchIndication;
              setPendingSwitchIndication(null);
              if (onSwitchIndication && targetInd) {
                onSwitchIndication(targetInd.caseIndicationId);
              }
            }}
          >
            Confirm & Switch
          </Button>
        </div>
      </Modal>
    </div>
  );
}
