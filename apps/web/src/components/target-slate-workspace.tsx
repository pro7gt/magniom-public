'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { TargetSlate, TargetCandidate } from '@magniom/domain';
import {
  TargetSlateViewModel,
  PhenotypeViewModel,
  toEvidenceDrawerViewModel,
  ConvergenceViewModel,
  toClinical3DViewerViewModel,
} from '@magniom/presentation';
import { TargetCard } from './target-card';
import { EvidenceDrawer } from './evidence-drawer';
import { Clinical3DViewer } from './clinical-3d-viewer';

interface TargetSlateWorkspaceProps {
  caseId: string;
  phenotypeVM: PhenotypeViewModel;
  slateVM: TargetSlateViewModel;
  slate?: TargetSlate | undefined;
  convergenceVM: ConvergenceViewModel;
  initialSelectedCandidateId?: string | undefined;
  initialEvidenceCandidateId?: string | undefined;
}

export function TargetSlateWorkspace({
  caseId,
  phenotypeVM,
  slateVM,
  slate,
  convergenceVM,
  initialSelectedCandidateId,
  initialEvidenceCandidateId,
}: TargetSlateWorkspaceProps) {
  const allCandidates = [...slateVM.primaryCandidates, ...slateVM.additionalCandidates];
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    initialSelectedCandidateId || slateVM.primaryCandidates[0]?.id || '',
  );
  const [evidenceCandidateId, setEvidenceCandidateId] = useState<string | null>(
    initialEvidenceCandidateId || null,
  );

  const selectedCandidate =
    allCandidates.find(c => c.id === selectedCandidateId) || slateVM.primaryCandidates[0];

  const evidenceCandidate = evidenceCandidateId
    ? allCandidates.find(c => c.id === evidenceCandidateId)
    : null;

  const evidenceDrawerVM = evidenceCandidate
    ? toEvidenceDrawerViewModel(evidenceCandidate as any)
    : null;

  const fallbackSlate: TargetSlate = useMemo(() => {
    if (slate) return slate;
    return {
      id: slateVM.id,
      caseId,
      phenotypeSnapshotId: slateVM.phenotypeSnapshotId,
      scientificPolicyVersion: '1.0.0',
      evidenceReleaseVersion: '1.0.0',
      status: 'ready_for_review',
      generatedAt: new Date().toISOString(),
      mode: 'CLINICAL',
      primaryCandidates: slateVM.primaryCandidates.map(c => ({
        id: c.id,
        familyId: c.familyId,
        circuitId: 'TC-MDD-CONVERGENT-001',
        role: c.role,
        method: c.method as any,
        evidenceTier: c.evidenceTier,
        mniCoordinate: c.mniCoordinate,
        evidenceScore: 0.9,
        phenotypeConcordanceScore: 0.85,
        overallScore: 0.88,
        rationale: c.whyNominated,
        contraindicationsOrConflicts: c.conflictingEvidence,
        isSuppressedOrRedundant: false,
      })),
      additionalCandidates: slateVM.additionalCandidates.map(c => ({
        id: c.id,
        familyId: c.familyId,
        circuitId: 'TC-MDD-DYSPHORIC-001',
        role: c.role,
        method: c.method as any,
        evidenceTier: c.evidenceTier,
        mniCoordinate: c.mniCoordinate,
        evidenceScore: 0.8,
        phenotypeConcordanceScore: 0.75,
        overallScore: 0.78,
        rationale: c.whyNominated,
        contraindicationsOrConflicts: c.conflictingEvidence,
        isSuppressedOrRedundant: false,
      })),
      suppressedCandidates: [],
      deterministicManifestHash: slateVM.manifestHash,
    };
  }, [slate, slateVM, caseId]);

  const rawDomainCandidates: TargetCandidate[] = useMemo(() => {
    return [...fallbackSlate.primaryCandidates, ...fallbackSlate.additionalCandidates];
  }, [fallbackSlate]);

  const clinical3dVM = useMemo(() => {
    return toClinical3DViewerViewModel(fallbackSlate, rawDomainCandidates, selectedCandidateId);
  }, [fallbackSlate, rawDomainCandidates, selectedCandidateId]);

  return (
    <div className="workspace-3col">
      {/* Column 1 (Left): Persistent Clinical Context */}
      <aside className="col-context" aria-label="Clinical Context Column">
        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            CLINICAL INDICATION
          </span>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '0.25rem',
            }}
          >
            {phenotypeVM.primaryDiagnosis}
          </h2>
          <span
            className="badge badge-tier1"
            style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
          >
            Phenotype Approved & Sealed
          </span>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Treatment Priorities
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            {phenotypeVM.domains.slice(0, 3).map(domain => (
              <div
                key={domain.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>
                    #{domain.clinicalPriority} {domain.domainName}
                  </strong>
                </div>
                <span
                  style={{
                    color:
                      domain.severityLabel === 'Severe' || domain.severityLabel === 'Extreme'
                        ? '#f87171'
                        : '#38bdf8',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {domain.severityLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Patient Functional Goals
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: '#cbd5e1',
            }}
          >
            {phenotypeVM.patientGoals.map((goal, idx) => (
              <li key={idx}>• {goal}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ background: '#0d1627' }}>
          <h3
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--accent-cyan)',
              marginBottom: '0.5rem',
            }}
          >
            Personalisation Status
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{slateVM.qualificationLabel}</p>
          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Manifest: {slateVM.manifestHash.slice(0, 16)}...
          </div>
        </div>
      </aside>

      {/* Column 2 (Centre): 3D Clinical Viewer & Convergence Representation */}
      <section className="col-spatial" aria-label="Spatial and Convergence Column">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>3D Clinical Cortical Viewer</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Interactive cortical surface inspection, target ROI localization, and evidence
              counterfactual analysis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              href={`/cases/${caseId}/compare`}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              Compare Matrix →
            </Link>
            <Link
              href={`/cases/${caseId}/decision`}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem' }}
              id="begin-decision-btn"
            >
              Begin Clinical Decision →
            </Link>
          </div>
        </div>

        {/* 3D Clinical Viewer Island */}
        <Clinical3DViewer
          viewModel={clinical3dVM}
          onSelectCandidate={id => setSelectedCandidateId(id)}
        />

        {/* Target Convergence Diagnostics */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
              Target Convergence Diagnostic
            </h3>
            <span className={`badge ${convergenceVM.badgeClass}`}>{convergenceVM.headline}</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            {convergenceVM.summary}
          </p>
          {convergenceVM.details.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {convergenceVM.details.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{item.sourceName}:</span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginTop: '0.15rem',
                    }}
                  >
                    {item.coordinateFormatted} ({item.deltaFromAnchorMm} mm)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Column 3 (Right): Target Slate Cards */}
      <section className="col-slate" aria-label="Target Slate Candidates Column">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Target Slate Candidates</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {slateVM.primaryCandidates.length} Primary Hypotheses +{' '}
            {slateVM.additionalCandidates.length} Alternatives
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {slateVM.primaryCandidates.map(candidate => (
            <TargetCard
              key={candidate.id}
              candidate={candidate}
              isSelected={candidate.id === selectedCandidate?.id}
              onSelect={() => setSelectedCandidateId(candidate.id)}
              onOpenEvidenceDrawer={id => setEvidenceCandidateId(id)}
            />
          ))}

          {slateVM.additionalCandidates.map(candidate => (
            <TargetCard
              key={candidate.id}
              candidate={candidate}
              isSelected={candidate.id === selectedCandidate?.id}
              onSelect={() => setSelectedCandidateId(candidate.id)}
              onOpenEvidenceDrawer={id => setEvidenceCandidateId(id)}
            />
          ))}

          {slateVM.suppressedCandidates.length > 0 && (
            <div className="card" style={{ background: '#11141e', borderStyle: 'dashed' }}>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Suppressed Target Hypotheses ({slateVM.suppressedCandidates.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {slateVM.suppressedCandidates.map(suppressed => (
                  <div
                    key={suppressed.id}
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    <strong style={{ color: '#9ca3af' }}>{suppressed.name}</strong>:{' '}
                    {suppressed.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Evidence Slide-Over Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(evidenceCandidateId)}
        onClose={() => setEvidenceCandidateId(null)}
        viewModel={evidenceDrawerVM}
      />
    </div>
  );
}
