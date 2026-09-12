'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Breadcrumbs,
  ArrowRightIcon,
  PageHeader,
} from '@/components/ui';

import React, { useState, useMemo } from 'react';
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
  caseCode?: string;
  phenotypeVM: PhenotypeViewModel;
  slateVM: TargetSlateViewModel;
  slate?: TargetSlate | undefined;
  convergenceVM: ConvergenceViewModel;
  initialSelectedCandidateId?: string | undefined;
  initialEvidenceCandidateId?: string | undefined;
}

export function TargetSlateWorkspace({
  caseId,
  caseCode,
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
    <div className="px-6">
      <Breadcrumbs
        ariaLabel="Target Slate Breadcrumb"
        items={[
          { label: caseCode || caseId, href: `/cases/${caseId}` },
          { label: 'Target Slate & Candidates', current: true },
        ]}
      />
      <PageHeader
        title="Target Slate & Candidates Workspace"
        subtitle="Algorithmic candidate nomination, biophysical convergence, and clinical evidence synthesis."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" href={`/cases/${caseId}/compare`} className="text-sm">
              Compare Matrix <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button
              variant="primary"
              href={`/cases/${caseId}/decision`}
              className="text-sm"
              id="begin-decision-btn"
            >
              Begin Clinical Decision <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </div>
        }
      />
      <div className="workspace-3col py-2 pb-6">
        {/* Column 1 (Left): Persistent Clinical Context */}
        <aside className="col-context" aria-label="Clinical Context Column">
          <Card>
            <CardHeader className="p-0 mb-2">
              <span className="text-xs font-semibold text-secondary uppercase">
                CLINICAL INDICATION
              </span>
              <CardTitle as="h2" className="text-lg font-bold text-primary mt-1">
                {phenotypeVM.primaryDiagnosis}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Badge variant="tier1" className="mt-2 self-start">
                Phenotype Approved & Sealed
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h3" className="text-base font-semibold mb-3">
                Treatment Priorities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                {phenotypeVM.domains.slice(0, 3).map(domain => (
                  <div key={domain.id} className="data-spec-row">
                    <div>
                      <strong>
                        #{domain.clinicalPriority} {domain.domainName}
                      </strong>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        domain.severityLabel === 'Severe' || domain.severityLabel === 'Extreme'
                          ? 'text-rose'
                          : 'text-cyan'
                      }`}
                    >
                      {domain.severityLabel}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h3" className="text-base font-semibold mb-3">
                Patient Functional Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-none flex flex-col gap-2 text-sm text-secondary">
                {phenotypeVM.patientGoals.map((goal, idx) => (
                  <li key={idx}>• {goal}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-surface-card">
            <CardHeader>
              <CardTitle as="h3" className="text-base font-semibold text-cyan mb-2">
                Personalisation Status
              </CardTitle>
              <CardDescription>{slateVM.qualificationLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 text-xs text-muted font-mono">
                Manifest: {slateVM.manifestHash.slice(0, 16)}...
              </div>
            </CardContent>
          </Card>

          {/* Guide 2 §182: Network Context Card */}
          <Card className="bg-surface-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle as="h3" className="text-base font-semibold text-primary">
                  Systems Context Layer
                </CardTitle>
                <Badge variant="neutral" className="text-xs">
                  OBSERVATIONAL
                </Badge>
              </div>
              <CardDescription>Triple-Network Architecture (CEN · DMN · SN)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-xs">
                <div className="data-spec-row">
                  <span className="text-secondary">Primary Modulation:</span>
                  <span className="font-mono text-cyan font-semibold">CEN–DMN Anti-Coupled</span>
                </div>
                <div className="data-spec-row">
                  <span className="text-secondary">Salience Switching:</span>
                  <span className="text-emerald font-medium">Qualified</span>
                </div>
                <div className="text-muted text-xs italic mt-1">
                  Observational systems context only. Does not autonomously determine target
                  validity.
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/cases/${caseId}/triple-network`}
                  className="mt-2 text-xs w-full"
                >
                  Inspect Triple-Network Layer <ArrowRightIcon size={12} className="ml-1 inline" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Column 2 (Centre): 3D Clinical Viewer & Convergence Representation */}
        <section className="col-spatial" aria-label="Spatial and Convergence Column">
          <div className="mb-2">
            <h2 className="text-xl font-bold">3D Clinical Cortical Viewer</h2>
            <p className="text-sm text-secondary">
              Interactive cortical surface inspection, target ROI localization, and evidence
              counterfactual analysis.
            </p>
          </div>

          {/* 3D Clinical Viewer Island */}
          <Clinical3DViewer
            viewModel={clinical3dVM}
            onSelectCandidate={id => setSelectedCandidateId(id)}
          />

          {/* Target Convergence Diagnostics */}
          <Card className="mt-4">
            <CardHeader className="flex justify-between items-center mb-2">
              <CardTitle as="h3" className="text-base font-semibold">
                Target Convergence Diagnostic
              </CardTitle>
              <Badge className={`${convergenceVM.badgeClass}`}>{convergenceVM.headline}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-3">{convergenceVM.summary}</p>
              {convergenceVM.details.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {convergenceVM.details.map((item, idx) => (
                    <div key={idx} className="bg-surface-elevated p-2 rounded-md text-xs">
                      <span className="text-secondary">{item.sourceName}:</span>
                      <div className="font-mono font-semibold text-primary mt-0.5">
                        {item.coordinateFormatted} ({item.deltaFromAnchorMm} mm)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Column 3 (Right): Target Slate Cards */}
        <section className="col-slate" aria-label="Target Slate Candidates Column">
          <div>
            <h2 className="text-xl font-bold">Target Slate Candidates</h2>
            <p className="text-sm text-secondary">
              {slateVM.primaryCandidates.length} Primary Hypotheses +{' '}
              {slateVM.additionalCandidates.length} Alternatives
            </p>
          </div>

          <div className="flex flex-col gap-4">
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
              <Card className="bg-surface-card border-dashed">
                <CardHeader>
                  <CardTitle as="h3" className="text-sm font-semibold text-secondary mb-2">
                    Suppressed Target Hypotheses ({slateVM.suppressedCandidates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {slateVM.suppressedCandidates.map(suppressed => (
                      <div key={suppressed.id} className="text-xs text-muted">
                        <strong className="text-secondary">{suppressed.name}</strong>:{' '}
                        {suppressed.explanation}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
    </div>
  );
}
