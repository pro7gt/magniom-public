'use client';

import {
  CheckIcon,
  XIcon,
  EditIcon,
  ClockIcon,
  SmartphoneIcon,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Breadcrumbs,
  ArrowRightIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  PageHeader,
  Alert,
  Input,
  Textarea,
  Checkbox,
  FormGroup,
  FormLabel,
} from '@/components/ui';

import React, { useState, useEffect } from 'react';
import { TargetSlateViewModel, DecisionReviewViewModel } from '@magniom/presentation';
import type { CandidateDecisionAction, MagniomInfluence, MniCoordinate } from '@magniom/domain';
import {
  createMultiTabSignOffGuard,
  type MultiTabSignOffEvent,
} from '../lib/security/sign-off-guard';

interface DecisionWorkspaceProps {
  caseId: string;
  caseCode?: string;
  slateVM: TargetSlateViewModel;
  existingDecisionVM?: DecisionReviewViewModel | null | undefined;
  mode?: import('@magniom/domain').MagniomMode | undefined;
  onSignDecision: (params: {
    overallReasoning: string;
    magniomInfluence: MagniomInfluence;
    disagreementWithMagniom?: string | undefined;
    clinicianName: string;
    licenseNumber: string;
    attestationStatement: string;
  }) => void;
  onSaveCandidateDecision: (
    candidateId: string,
    action: CandidateDecisionAction,
    reasonCodes: string[],
    freeTextReason?: string | undefined,
    modifiedCoord?: MniCoordinate | undefined,
  ) => void;
  onCreateRevisedDecision?: (() => void) | undefined;
}

const ACCEPT_REASONS = [
  'Strong clinical phenotype fit',
  'Robust Tier 1/2 evidence basis',
  'High connectome reliability & concordance',
  'Documented positive prior response',
  'Optimal anatomical depth & accessibility',
];

const REJECT_REASONS = [
  'Secondary symptom circuit takes clinical precedence',
  'Evidence ceiling / trial population concern',
  'Low connectome reliability / spatial variance',
  'Documented prior treatment non-response',
  'Patient anatomical / skull depth concern',
  'Patient preference for standard protocol',
  'Independent specialist clinical judgement',
];

interface CandidateActionState {
  action: CandidateDecisionAction;
  reasons: string[];
  freeText?: string | undefined;
  modifiedX?: number | undefined;
  modifiedY?: number | undefined;
  modifiedZ?: number | undefined;
}

export function DecisionWorkspace({
  caseId,
  caseCode,
  slateVM,
  existingDecisionVM,
  mode,
  onSignDecision,
  onSaveCandidateDecision,
  onCreateRevisedDecision,
}: DecisionWorkspaceProps) {
  const isImmutable = existingDecisionVM?.isImmutable;
  const isResearchMode =
    mode === 'research' ||
    (slateVM as unknown as { mode?: string; isResearchMode?: boolean }).isResearchMode === true ||
    (slateVM as unknown as { mode?: string }).mode === 'research';

  const [withholdStimulation, setWithholdStimulation] = useState(false);

  // Candidate Decisions State
  const [candidateActions, setCandidateActions] = useState<Record<string, CandidateActionState>>(
    () => {
      const initial: Record<string, CandidateActionState> = {};
      slateVM.primaryCandidates.forEach(c => {
        initial[c.id] = {
          action: 'accept' as CandidateDecisionAction,
          reasons: [ACCEPT_REASONS[0] || 'Strong clinical phenotype fit'],
        };
      });
      return initial;
    },
  );

  // Global Decision Form State
  const [overallReasoning, setOverallReasoning] = useState(
    existingDecisionVM?.overallReasoning && existingDecisionVM.isImmutable
      ? existingDecisionVM.overallReasoning
      : '',
  );
  const [magniomInfluence, setMagniomInfluence] = useState<MagniomInfluence>(
    (existingDecisionVM?.magniomInfluence as MagniomInfluence) || 'moderate',
  );
  const [disagreement, setDisagreement] = useState(
    existingDecisionVM?.disagreementWithMagniom || '',
  );
  const [clinicianName, setClinicianName] = useState(
    existingDecisionVM?.clinicianName || 'Dr. Sarah Lin, MD, FRANZCP',
  );
  const [licenseNumber, setLicenseNumber] = useState(
    existingDecisionVM?.clinicianLicense || 'MED-TMS-99281',
  );
  const [attestationConfirmed, setAttestationConfirmed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [multiTabAlert, setMultiTabAlert] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const { cleanup } = createMultiTabSignOffGuard((event: MultiTabSignOffEvent) => {
      if (event.caseId === caseId) {
        setMultiTabAlert(
          `Notice: Sign-off activity detected in another browser tab (${event.type}). State synchronized.`,
        );
      }
    });
    return cleanup;
  }, [caseId]);

  const attestationStatement =
    'I confirm that I have independently reviewed the clinical context, evidence provenance, target reliability, alternatives and limitations. The final target selection represents my clinical decision and not an autonomous Magniom prescription.';

  const handleActionChange = (candidateId: string, action: CandidateDecisionAction) => {
    if (isImmutable) return;
    const defaultReasons =
      action === 'accept'
        ? [ACCEPT_REASONS[0] || 'Strong clinical phenotype fit']
        : [REJECT_REASONS[0] || 'Patient preference / prior response'];
    const current = candidateActions[candidateId];
    const updatedState: CandidateActionState = {
      action,
      reasons: defaultReasons,
      ...(current?.freeText ? { freeText: current.freeText } : {}),
      ...(current?.modifiedX !== undefined ? { modifiedX: current.modifiedX } : {}),
      ...(current?.modifiedY !== undefined ? { modifiedY: current.modifiedY } : {}),
      ...(current?.modifiedZ !== undefined ? { modifiedZ: current.modifiedZ } : {}),
    };
    const updated: Record<string, CandidateActionState> = {
      ...candidateActions,
      [candidateId]: updatedState,
    };
    setCandidateActions(updated);
    onSaveCandidateDecision(candidateId, action, defaultReasons, updated[candidateId]?.freeText);
  };

  const handleReasonToggle = (candidateId: string, reason: string) => {
    if (isImmutable) return;
    const current = candidateActions[candidateId]?.reasons || [];
    const updatedReasons = current.includes(reason)
      ? current.filter(r => r !== reason)
      : [...current, reason];

    const currentItem = candidateActions[candidateId];
    const updatedItem: CandidateActionState = {
      action: currentItem?.action || 'accept',
      reasons: updatedReasons,
      ...(currentItem?.freeText ? { freeText: currentItem.freeText } : {}),
      ...(currentItem?.modifiedX !== undefined ? { modifiedX: currentItem.modifiedX } : {}),
      ...(currentItem?.modifiedY !== undefined ? { modifiedY: currentItem.modifiedY } : {}),
      ...(currentItem?.modifiedZ !== undefined ? { modifiedZ: currentItem.modifiedZ } : {}),
    };

    setCandidateActions({
      ...candidateActions,
      [candidateId]: updatedItem,
    });
    onSaveCandidateDecision(
      candidateId,
      currentItem?.action || 'accept',
      updatedReasons,
      currentItem?.freeText,
    );
  };

  const handleExecuteSign = () => {
    if (!overallReasoning.trim() || !attestationConfirmed || slateVM.isStale) return;
    setIsSigning(true);
    try {
      onSignDecision({
        overallReasoning,
        magniomInfluence,
        disagreementWithMagniom: disagreement || undefined,
        clinicianName,
        licenseNumber,
        attestationStatement,
      });
    } finally {
      setIsSigning(false);
    }
  };

  const isPrimary1Rejected =
    slateVM.primaryCandidates[0] &&
    candidateActions[slateVM.primaryCandidates[0].id]?.action === 'reject';

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Clinical Decision Breadcrumb"
        items={[
          { label: caseCode || caseId, href: `/cases/${caseId}` },
          { label: 'Clinical Decision & Attestation', current: true },
        ]}
      />
      {/* Header & Status */}
      <PageHeader
        title="Final Clinical Target Decision & Attestation"
        subtitle="Authoritative clinical decision-making workspace. Final targeting selection requires explicit clinician review and independent rationale."
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/targets`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Return to Target Slate
            </Button>
            <Button variant="secondary" href={`/cases/${caseId}/audit`}>
              View Immutable Audit <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* Signed Confirmation Banner */}
      {isImmutable && (
        <Alert
          variant="success"
          title="CLINICAL TARGET DECISION SIGNED & IMMUTABLE"
          description={
            <>
              <p className="text-primary text-sm mt-1">
                Signed by <strong>{existingDecisionVM.clinicianName}</strong> (
                {existingDecisionVM.clinicianLicense}) on {existingDecisionVM.signedAt}
              </p>
              <div className="text-xs font-mono text-muted mt-1">
                Digital Signature Hash: {existingDecisionVM.digitalSignatureHash}
              </div>
            </>
          }
          actions={
            onCreateRevisedDecision ? (
              <Button variant="secondary" onClick={onCreateRevisedDecision} className="border-cyan">
                Create Revised Target Decision <RefreshCwIcon size={14} className="ml-1 inline" />
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Research Mode Warning Banner (§32 Criterion 7) */}
      {isResearchMode && (
        <Alert
          id="research-mode-warning-banner"
          variant="warning"
          title="RESEARCH MODE ACTIVE — CLINICAL DIGITAL SIGNING PROHIBITED"
          description="This Target Slate was generated in Research Mode. Per Magniom Governance §32 Criterion 7, research candidates cannot be signed as a clinical decision. Output is strictly for investigational review."
        />
      )}

      {/* No Target / Withhold Stimulation Action Panel (§32 Criterion 6) */}
      {!isImmutable && (
        <div
          id="withhold-stimulation-panel"
          className={`rounded-lg p-4 flex justify-between items-center flex-wrap gap-3 ${
            withholdStimulation ? 'bg-rose-500/15 border-danger' : 'bg-surface-card border'
          }`}
        >
          <div>
            <strong className={`text-base ${withholdStimulation ? 'text-rose' : 'text-primary'}`}>
              Specialist Discretion: Withhold Stimulation / No Target Selected
            </strong>
            <p className="text-secondary text-sm mt-1">
              Per §32 Criterion 6, the treating specialist clinician may determine that no target
              candidate meets clinical risk-benefit threshold.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              const next = !withholdStimulation;
              setWithholdStimulation(next);
              if (next) {
                const allRejected: Record<string, CandidateActionState> = {};
                [...slateVM.primaryCandidates, ...slateVM.additionalCandidates].forEach(c => {
                  allRejected[c.id] = {
                    action: 'reject',
                    reasons: ['Independent specialist clinical judgement'],
                    freeText: 'Withhold stimulation based on specialist clinical judgement.',
                  };
                });
                setCandidateActions(allRejected);
                if (!overallReasoning) {
                  setOverallReasoning(
                    'Treating clinician determined to withhold stimulation following independent target review.',
                  );
                }
              }
            }}
            variant={withholdStimulation ? 'danger' : 'secondary'}
            id="withhold-stimulation-toggle-btn"
          >
            {withholdStimulation
              ? 'Stimulation Withheld (No Target)'
              : 'Withhold Stimulation (No Target)'}
          </Button>
        </div>
      )}

      <div className="decision-grid">
        {/* Left Column: Candidate-Level Actions & Justifications */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="text-lg font-semibold mb-2">
                Candidate Review & Disposition
              </CardTitle>
              <CardDescription className="mb-4">
                For each candidate on the Target Slate, indicate whether you accept, reject, modify,
                or defer targeting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {slateVM.primaryCandidates.map(candidate => {
                  const current = candidateActions[candidate.id] || {
                    action: 'accept',
                    reasons: [],
                  };
                  const isAccept = current.action === 'accept';
                  const isReject = current.action === 'reject';
                  const isModify = current.action === 'modify';
                  const isDefer = current.action === 'defer';

                  return (
                    <div
                      key={candidate.id}
                      className="bg-surface-elevated border rounded-lg p-4 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-cyan">{candidate.roleTitle}</strong>
                          <span className="ml-2 text-sm text-secondary">
                            ({candidate.targetName} • {candidate.coordinateFormatted})
                          </span>
                        </div>
                        <Badge className={`${candidate.evidenceTierBadgeClass}`}>
                          {candidate.evidenceTierLabel}
                        </Badge>
                      </div>

                      {/* Action Selector Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleActionChange(candidate.id, 'accept')}
                          className={`decision-action-button ${isAccept ? 'selected-accept' : ''}`}
                          disabled={isImmutable}
                          id={`action-accept-${candidate.id}`}
                        >
                          <CheckIcon size={14} className="mr-1.5 inline" /> Accept Candidate
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleActionChange(candidate.id, 'reject')}
                          className={`decision-action-button ${isReject ? 'selected-reject' : ''}`}
                          disabled={isImmutable}
                          id={`action-reject-${candidate.id}`}
                        >
                          <XIcon size={14} className="mr-1.5 inline" /> Reject Candidate
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleActionChange(candidate.id, 'modify')}
                          className={`decision-action-button ${isModify ? 'selected-modify' : ''}`}
                          disabled={isImmutable}
                          id={`action-modify-${candidate.id}`}
                        >
                          <EditIcon size={14} className="mr-1.5 inline" /> Modify Coordinate
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleActionChange(candidate.id, 'defer')}
                          className={`decision-action-button ${isDefer ? 'selected-defer' : ''}`}
                          disabled={isImmutable}
                          id={`action-defer-${candidate.id}`}
                        >
                          <ClockIcon size={14} className="mr-1.5 inline" /> Defer TMS Plan
                        </Button>
                      </div>

                      {/* Structured Reason Checklist */}
                      {!isImmutable && (
                        <div className="bg-surface-drawer p-3 rounded-md text-sm">
                          <span className="font-semibold text-secondary block mb-2">
                            Select Applicable Clinical Reasons (Mandatory):
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {(isReject ? REJECT_REASONS : ACCEPT_REASONS).map(reason => (
                              <Checkbox
                                key={reason}
                                checked={current.reasons.includes(reason)}
                                onChange={() => handleReasonToggle(candidate.id, reason)}
                                disabled={isImmutable}
                                label={reason}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Coordinate Modification Sub-panel */}
                      {isModify && (
                        <div className="bg-surface-card border-subtle p-3 rounded-md text-sm">
                          <strong className="text-cyan">
                            Clinician Coordinate Adjustment (MNI152):
                          </strong>
                          <div className="flex gap-3 mt-2">
                            <Input
                              type="number"
                              className="w-20"
                              placeholder="X"
                              defaultValue={candidate.mniCoordinate.x}
                              disabled={isImmutable}
                            />
                            <Input
                              type="number"
                              className="w-20"
                              placeholder="Y"
                              defaultValue={candidate.mniCoordinate.y}
                              disabled={isImmutable}
                            />
                            <Input
                              type="number"
                              className="w-20"
                              placeholder="Z"
                              defaultValue={candidate.mniCoordinate.z}
                              disabled={isImmutable}
                            />
                          </div>
                          <p className="text-secondary text-xs mt-1.5">
                            Live Euclidean delta from original candidate will be recorded immutably
                            in the signed record.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Substantive Human-Authored Rationale (Section 91 & Safeguard 10) */}
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="text-lg font-semibold mb-2">
                Substantive Clinical Reasoning (Human-Authored)
              </CardTitle>
              <CardDescription className="mb-3">
                Explicitly document reasoning for selecting, adjusting, or rejecting candidates per
                IEC 62304 and ISO 14971 standards:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={overallReasoning}
                onChange={e => setOverallReasoning(e.target.value)}
                placeholder="Author substantive clinical reasoning here (e.g., patient clinical presentation, previous treatment responses, why selected targets align with current goals)..."
                disabled={isImmutable}
                id="clinical-reasoning-textarea"
              />
            </CardContent>
          </Card>

          {/* Disagreement prompt if Primary 1 rejected */}
          {isPrimary1Rejected && (
            <Card className="bg-surface-card border-rose">
              <CardHeader>
                <CardTitle as="h3" className="text-base font-semibold text-rose mb-2">
                  Scientific Disagreement / Override Formulation
                </CardTitle>
                <CardDescription className="text-rose mb-2">
                  You have rejected Primary Candidate 1. Please document the specific points of
                  divergence from Magniom's algorithmic nomination:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={disagreement}
                  onChange={e => setDisagreement(e.target.value)}
                  placeholder="Detail the scientific, clinical, or patient-specific grounds for departing from Primary 1..."
                  disabled={isImmutable}
                  id="disagreement-reasoning-textarea"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Pre-Sign Summary, Influence & Attestation */}
        <div className="flex flex-col gap-5">
          {/* Magniom Influence Selector */}
          <Card>
            <CardHeader>
              <CardTitle as="h3" className="text-base font-semibold mb-2">
                Magniom Influence Assessment
              </CardTitle>
              <CardDescription className="mb-3">
                How much did Magniom alter your target decision compared to prior independent
                reasoning?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'minor', 'moderate', 'major'] as MagniomInfluence[]).map(inf => (
                  <Button
                    key={inf}
                    onClick={() => setMagniomInfluence(inf)}
                    variant={magniomInfluence === inf ? 'primary' : 'secondary'}
                    size="sm"
                    className="capitalize text-sm p-1.5"
                    disabled={isImmutable}
                  >
                    {inf}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinician Identity & Pre-Sign Review */}
          <Card>
            <CardHeader>
              <CardTitle as="h3" className="text-base font-semibold mb-3">
                Treating Clinician Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormGroup>
                <FormLabel className="text-xs">Clinician Full Name:</FormLabel>
                <Input
                  type="text"
                  value={clinicianName}
                  onChange={e => setClinicianName(e.target.value)}
                  disabled={isImmutable}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel className="text-xs">Professional Registration / License:</FormLabel>
                <Input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  disabled={isImmutable}
                />
              </FormGroup>
            </CardContent>
          </Card>

          {/* Multi-Tab Invalidation Alert (§141) */}
          {multiTabAlert && <Alert variant="danger">{multiTabAlert}</Alert>}

          {/* Sign-Off Context Restatement Panel (§138) */}
          {!isImmutable && (
            <Card className="bg-surface-card border-cyan">
              <CardHeader className="flex items-center gap-2 mb-2">
                <Badge variant="neutral" className="text-xs">
                  §138 CONTEXT RESTATEMENT
                </Badge>
                <CardTitle as="h3" className="text-sm font-semibold text-primary">
                  Pre-Attestation Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Case Identifier:</span>
                    <strong className="font-mono text-cyan">{caseId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Deployment Mode:</span>
                    <Badge
                      className={`${mode === 'CLINICAL' ? 'badge-clinical' : mode === 'RESEARCH' ? 'badge-research' : 'badge-validation'} text-xs`}
                    >
                      {mode || 'CLINICAL'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Target Slate ID:</span>
                    <span className="font-mono text-secondary">{slateVM.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Candidates Evaluated:</span>
                    <span className="text-secondary">
                      {slateVM.primaryCandidates.length + slateVM.additionalCandidates.length}{' '}
                      candidate(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Treating Clinician (§28):</span>
                    <strong className="text-primary">{clinicianName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Statutory License:</span>
                    <span className="text-secondary">{licenseNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attestation & Sign Button */}
          {!isImmutable && (
            <Card className="bg-surface-card border-subtle">
              <CardHeader>
                <CardTitle as="h3" className="text-base font-bold text-cyan mb-2">
                  Legal &amp; Clinical Attestation
                </CardTitle>
                <CardDescription className="mb-3 leading-relaxed">
                  {attestationStatement}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Checkbox
                  id="attestation-checkbox"
                  checked={attestationConfirmed}
                  onChange={e => setAttestationConfirmed(e.target.checked)}
                  label={
                    <strong className="text-primary">
                      I independently confirm and sign this decision
                    </strong>
                  }
                  className="mb-4 text-sm"
                />

                {isMobileViewport && (
                  <Alert
                    variant="warning"
                    className="mb-3"
                    icon={<SmartphoneIcon size={16} className="text-amber flex-shrink-0" />}
                    title="Mobile Signing Disabled (§183)"
                    description="Clinical decision signing on small screens (<768px) is disabled until full evidence & spatial geometry review is formally validated for mobile devices. Please review and sign on a clinical desktop display."
                  />
                )}

                <Button
                  variant={withholdStimulation ? 'danger' : 'primary'}
                  onClick={handleExecuteSign}
                  disabled={
                    isResearchMode ||
                    isMobileViewport ||
                    !attestationConfirmed ||
                    !overallReasoning.trim() ||
                    isSigning ||
                    slateVM.isStale
                  }
                  className="w-full p-3 text-base font-bold"
                  id="sign-target-decision-btn"
                >
                  {isResearchMode ? (
                    'Clinical Signing Prohibited (Research Slate)'
                  ) : isMobileViewport ? (
                    'Signing Disabled on Mobile Viewport (§183)'
                  ) : isSigning ? (
                    'Cryptographically Signing...'
                  ) : withholdStimulation ? (
                    <>
                      Sign Decision: Withhold Stimulation{' '}
                      <ArrowRightIcon size={14} className="ml-1 inline" />
                    </>
                  ) : (
                    <>
                      Sign Target Decision <ArrowRightIcon size={14} className="ml-1 inline" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
