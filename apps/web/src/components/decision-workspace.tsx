'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TargetSlateViewModel, DecisionReviewViewModel } from '@magniom/presentation';
import type { CandidateDecisionAction, MagniomInfluence, MniCoordinate } from '@magniom/domain';

interface DecisionWorkspaceProps {
  caseId: string;
  slateVM: TargetSlateViewModel;
  existingDecisionVM?: DecisionReviewViewModel | null | undefined;
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
  slateVM,
  existingDecisionVM,
  onSignDecision,
  onSaveCandidateDecision,
  onCreateRevisedDecision,
}: DecisionWorkspaceProps) {
  const isImmutable = existingDecisionVM?.isImmutable;

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
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            Final Clinical Target Decision & Attestation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Authoritative clinical decision-making workspace. Final targeting selection requires
            explicit clinician review and independent rationale.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-secondary">
            ← Return to Target Slate
          </Link>
          <Link href={`/cases/${caseId}/audit`} className="btn btn-secondary">
            View Immutable Audit →
          </Link>
        </div>
      </div>

      {/* Signed Confirmation Banner */}
      {isImmutable && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #059669',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong style={{ color: '#34d399', fontSize: '1rem' }}>
              ✓ CLINICAL TARGET DECISION SIGNED & IMMUTABLE
            </strong>
            <p style={{ color: '#e2e8f0', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Signed by <strong>{existingDecisionVM.clinicianName}</strong> (
              {existingDecisionVM.clinicianLicense}) on {existingDecisionVM.signedAt}
            </p>
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
              }}
            >
              Digital Signature Hash: {existingDecisionVM.digitalSignatureHash}
            </div>
          </div>

          {onCreateRevisedDecision && (
            <button
              onClick={onCreateRevisedDecision}
              className="btn btn-secondary"
              style={{ borderColor: 'var(--accent-cyan)' }}
            >
              Create Revised Target Decision ↺
            </button>
          )}
        </div>
      )}

      <div className="decision-grid">
        {/* Left Column: Candidate-Level Actions & Justifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Candidate Review & Disposition
            </h2>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              For each candidate on the Target Slate, indicate whether you accept, reject, modify,
              or defer targeting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {slateVM.primaryCandidates.map(candidate => {
                const current = candidateActions[candidate.id] || { action: 'accept', reasons: [] };
                const isAccept = current.action === 'accept';
                const isReject = current.action === 'reject';
                const isModify = current.action === 'modify';
                const isDefer = current.action === 'defer';

                return (
                  <div
                    key={candidate.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          {candidate.roleTitle}
                        </strong>
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          ({candidate.targetName} • {candidate.coordinateFormatted})
                        </span>
                      </div>
                      <span className={`badge ${candidate.evidenceTierBadgeClass}`}>
                        {candidate.evidenceTierLabel}
                      </span>
                    </div>

                    {/* Action Selector Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleActionChange(candidate.id, 'accept')}
                        className={`decision-action-button ${isAccept ? 'selected-accept' : ''}`}
                        disabled={isImmutable}
                        id={`action-accept-${candidate.id}`}
                      >
                        ✓ Accept Candidate
                      </button>
                      <button
                        onClick={() => handleActionChange(candidate.id, 'reject')}
                        className={`decision-action-button ${isReject ? 'selected-reject' : ''}`}
                        disabled={isImmutable}
                        id={`action-reject-${candidate.id}`}
                      >
                        ✕ Reject Candidate
                      </button>
                      <button
                        onClick={() => handleActionChange(candidate.id, 'modify')}
                        className={`decision-action-button ${isModify ? 'selected-modify' : ''}`}
                        disabled={isImmutable}
                        id={`action-modify-${candidate.id}`}
                      >
                        ✎ Modify Coordinate
                      </button>
                      <button
                        onClick={() => handleActionChange(candidate.id, 'defer')}
                        className={`decision-action-button ${isDefer ? 'selected-defer' : ''}`}
                        disabled={isImmutable}
                        id={`action-defer-${candidate.id}`}
                      >
                        ⏱ Defer TMS Plan
                      </button>
                    </div>

                    {/* Structured Reason Checklist */}
                    {!isImmutable && (
                      <div
                        style={{
                          background: 'rgba(9, 13, 22, 0.6)',
                          padding: '0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Select Applicable Clinical Reasons (Mandatory):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {(isReject ? REJECT_REASONS : ACCEPT_REASONS).map(reason => (
                            <label
                              key={reason}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={current.reasons.includes(reason)}
                                onChange={() => handleReasonToggle(candidate.id, reason)}
                                disabled={isImmutable}
                              />
                              <span style={{ color: '#cbd5e1' }}>{reason}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coordinate Modification Sub-panel */}
                    {isModify && (
                      <div
                        style={{
                          background: '#0b1622',
                          border: '1px solid #1e3a5f',
                          padding: '0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <strong style={{ color: '#38bdf8' }}>
                          Clinician Coordinate Adjustment (MNI152):
                        </strong>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '80px' }}
                            placeholder="X"
                            defaultValue={candidate.mniCoordinate.x}
                            disabled={isImmutable}
                          />
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '80px' }}
                            placeholder="Y"
                            defaultValue={candidate.mniCoordinate.y}
                            disabled={isImmutable}
                          />
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '80px' }}
                            placeholder="Z"
                            defaultValue={candidate.mniCoordinate.z}
                            disabled={isImmutable}
                          />
                        </div>
                        <p
                          style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            marginTop: '0.375rem',
                          }}
                        >
                          Live Euclidean delta from original candidate will be recorded immutably in
                          the signed record.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Substantive Human-Authored Rationale (Section 91 & Safeguard 10) */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Substantive Clinical Reasoning (Human-Authored)
            </h2>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              Summarise why the selected target(s) best address the current clinical formulation and
              treatment objectives.
            </p>
            <textarea
              className="form-textarea"
              value={overallReasoning}
              onChange={e => setOverallReasoning(e.target.value)}
              placeholder="Author substantive clinical reasoning here (e.g., patient clinical presentation, previous treatment responses, why selected targets align with current goals)..."
              disabled={isImmutable}
              id="clinical-reasoning-textarea"
            />
          </div>

          {/* Disagreement prompt if Primary 1 rejected */}
          {isPrimary1Rejected && (
            <div className="card" style={{ background: '#1c1214', borderColor: '#7f1d1d' }}>
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#f87171',
                  marginBottom: '0.5rem',
                }}
              >
                Scientific Disagreement / Override Formulation
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
                You have rejected Primary Candidate 1. Please document the specific points of
                divergence from Magniom's algorithmic nomination:
              </p>
              <textarea
                className="form-textarea"
                value={disagreement}
                onChange={e => setDisagreement(e.target.value)}
                placeholder="Detail the scientific, clinical, or patient-specific grounds for departing from Primary 1..."
                disabled={isImmutable}
                id="disagreement-reasoning-textarea"
              />
            </div>
          )}
        </div>

        {/* Right Column: Pre-Sign Summary, Influence & Attestation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Magniom Influence Selector */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Magniom Influence Assessment
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              How much did Magniom alter your target decision compared to prior independent
              reasoning?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {(['none', 'minor', 'moderate', 'major'] as MagniomInfluence[]).map(inf => (
                <button
                  key={inf}
                  onClick={() => setMagniomInfluence(inf)}
                  className={`btn ${magniomInfluence === inf ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.8125rem', padding: '0.4rem' }}
                  disabled={isImmutable}
                >
                  {inf}
                </button>
              ))}
            </div>
          </div>

          {/* Clinician Identity & Pre-Sign Review */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Treating Clinician Identification
            </h3>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                Clinician Full Name:
              </label>
              <input
                type="text"
                className="form-input"
                value={clinicianName}
                onChange={e => setClinicianName(e.target.value)}
                disabled={isImmutable}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                Professional Registration / License:
              </label>
              <input
                type="text"
                className="form-input"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                disabled={isImmutable}
              />
            </div>
          </div>

          {/* Attestation & Sign Button */}
          {!isImmutable && (
            <div className="card" style={{ background: '#0a1322', borderColor: '#1e3a5f' }}>
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.5rem',
                }}
              >
                Legal & Clinical Attestation
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#cbd5e1',
                  marginBottom: '0.75rem',
                  lineHeight: 1.4,
                }}
              >
                {attestationStatement}
              </p>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={attestationConfirmed}
                  onChange={e => setAttestationConfirmed(e.target.checked)}
                  id="attestation-checkbox"
                />
                <strong style={{ color: '#fff' }}>
                  I independently confirm and sign this decision
                </strong>
              </label>

              <button
                onClick={handleExecuteSign}
                disabled={
                  !attestationConfirmed || !overallReasoning.trim() || isSigning || slateVM.isStale
                }
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                }}
                id="sign-target-decision-btn"
              >
                {isSigning ? 'Cryptographically Signing...' : 'Sign Target Decision →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
