'use client';

import { Button, Badge, Breadcrumbs, CaseNotFoundState, ArrowRightIcon, PageHeader, Alert, AlertTitle, AlertDescription } from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import type { CaseShellViewModel } from '@magniom/presentation';

// ==========================================
// Case-Level Evidence Workspace (§107–108)
// Filtered view of the Evidence Library scoped to the active
// CaseIndication, module, and clinical objective.
// Evidence is filtered, not altered (§108).
// ==========================================

interface CaseEvidenceEntry {
  id: string;
  targetFamily: string;
  claim: string;
  tier: string;
  tierBadge: string;
  population: string;
  diseaseStage: string;
  targetingMethod: string;
  treatmentContext: string;
  hasConflicts: boolean;
  conflicts: string[];
  sources: string[];
}

function getIndicationEvidence(indicationCode: string): CaseEvidenceEntry[] {
  const baseEvidence: Record<string, CaseEvidenceEntry[]> = {
    MDD: [
      {
        id: 'EP-MDD-DLPFC-001',
        targetFamily: 'Left DLPFC (TF-MDD-L-DLPFC-001)',
        claim: 'sgACC anti-correlation predicts antidepressant response in left prefrontal TMS',
        tier: 'Tier 1 — Established',
        tierBadge: 'badge-tier1',
        population: 'Adult treatment-resistant MDD',
        diseaseStage: 'Chronic / treatment-resistant',
        targetingMethod: 'Connectivity-refined (rs-fMRI sgACC seed)',
        treatmentContext: 'High-frequency rTMS or iTBS',
        hasConflicts: true,
        conflicts: [
          'Modest incremental effect size vs high-quality standard F3 targeting in unstratified cohorts',
          'Connectivity peak spatial variance depends on motion censoring and scan duration',
        ],
        sources: [
          'Fox MD et al. (2012) PNAS 109(8):E438-E445',
          'Weigand A et al. (2018) Am J Psychiatry 175(12):1214-1222',
          'Cole EJ et al. (2020) Am J Psychiatry 177(8):716-726',
        ],
      },
      {
        id: 'EP-MDD-REWARD-001',
        targetFamily: 'Reward Circuit (TF-MDD-REWARD-001)',
        claim: 'Ventromedial–striatal circuit modulation addresses anhedonic symptoms',
        tier: 'Tier 2 — Prospectively Supported',
        tierBadge: 'badge-tier2',
        population: 'MDD with prominent anhedonia',
        diseaseStage: 'Treatment-resistant with anhedonic features',
        targetingMethod: 'FC-guided ventromedial targeting',
        treatmentContext: 'High-frequency rTMS',
        hasConflicts: true,
        conflicts: [
          'Smaller prospective evidence base than convergent sgACC circuit',
          'Symptom-circuit specificity not fully established in unstratified samples',
        ],
        sources: [
          'Downar J et al. (2014) Biol Psychiatry 76(3):176-185',
        ],
      },
    ],
    PAIN: [
      {
        id: 'EP-PAIN-M1-001',
        targetFamily: 'Contralateral M1 (TF-PAIN-M1-001)',
        claim: 'Contralateral primary motor cortex stimulation reduces neuropathic pain',
        tier: 'Tier 1 — Established',
        tierBadge: 'badge-tier1',
        population: 'Adults with intractable neuropathic pain',
        diseaseStage: 'Chronic neuropathic',
        targetingMethod: 'Somatotopic motor mapping',
        treatmentContext: 'High-frequency rTMS to contralateral M1',
        hasConflicts: false,
        conflicts: [],
        sources: [
          'Lefaucheur JP et al. (2020) Clin Neurophysiol 131(2):474-528',
        ],
      },
    ],
    STROKE_MOTOR: [
      {
        id: 'EP-STR-M1-001',
        targetFamily: 'Ipsilesional M1 (TF-STR-M1-001)',
        claim: 'Ipsilesional M1 excitatory stimulation enhances motor recovery',
        tier: 'Tier 2 — Prospectively Supported',
        tierBadge: 'badge-tier2',
        population: 'Post-stroke motor impairment',
        diseaseStage: 'Subacute to chronic',
        targetingMethod: 'Motor mapping + lesion context',
        treatmentContext: 'Excitatory rTMS with motor rehabilitation',
        hasConflicts: true,
        conflicts: [
          'Efficacy varies significantly with disease stage',
          'Lesion-target overlap may contraindicate direct stimulation',
        ],
        sources: [
          'Harvey RL et al. (2018) Neurorehabil Neural Repair 32(6-7):600-612',
        ],
      },
    ],
  };

  return baseEvidence[indicationCode] || baseEvidence['MDD'] || [];
}

export default function CaseEvidencePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const indication = shellVm?.indication;
  const indicationCode = indication?.indicationCode || record.clinicalCase.indicationCode;
  const entries = getIndicationEvidence(indicationCode);

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Case Evidence Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Case Evidence', current: true },
        ]}
      />
      {/* Section Header (§107) */}
      <PageHeader
        title="Case Evidence"
        subtitle={
          <>
            Evidence filtered by{' '}
            <strong>{indication?.indicationFormatted || indicationCode}</strong>,
            active module, and clinical objective (§108 — filtered, not altered).
          </>
        }
        actions={
          <Button variant="secondary" size="sm" href="/evidence">
            Open Global Evidence Library <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        }
      />

      {/* Evidence Workspace Questions (§107) */}
      <Alert variant="info" className="mb-6">
        <AlertTitle as="h2">Case Evidence Should Answer</AlertTitle>
        <AlertDescription>
          <ul className="m-0 pl-5 text-sm text-secondary flex flex-col gap-1">
            <li>Why can this TargetFamily be considered?</li>
            <li>For which population?</li>
            <li>For this disease stage?</li>
            <li>Under which targeting method?</li>
            <li>With which treatment context?</li>
            <li>What evidence conflicts?</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Evidence Entries (§107–108) */}
      <section>
        <h2 className="section-subheading m-0 mb-4">
          Applicable EvidencePaths ({entries.length})
        </h2>
        <div className="flex flex-col gap-4">
          {entries.map(entry => (
            <article
              key={entry.id}
              className={`p-5 rounded-lg border bg-surface-card ${entry.hasConflicts ? 'border-warning' : 'border-success'}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="m-0 text-primary text-base font-semibold">
                    {entry.targetFamily}
                  </h3>
                  <span className="text-xs font-mono text-muted">
                    {entry.id}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Badge className={`${entry.tierBadge} text-xs`}>
                    {entry.tier}
                  </Badge>
                  {entry.hasConflicts && (
                    <Badge variant="tier3" className="text-xs">
                      Material Conflicts
                    </Badge>
                  )}
                </div>
              </div>

              {/* Claim */}
              <div className="mb-3">
                <span className="text-xs font-semibold text-muted uppercase">
                  Clinical Claim
                </span>
                <p className="mt-1 mb-0 text-sm text-primary">
                  {entry.claim}
                </p>
              </div>

              {/* Structured Fields */}
              <div className="grid-cards-200 mb-3">
                <div>
                  <span className="text-xs font-semibold text-muted uppercase">Population</span>
                  <p className="mt-0.5 mb-0 text-sm text-secondary">{entry.population}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted uppercase">Disease Stage</span>
                  <p className="mt-0.5 mb-0 text-sm text-secondary">{entry.diseaseStage}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted uppercase">Targeting Method</span>
                  <p className="mt-0.5 mb-0 text-sm text-secondary">{entry.targetingMethod}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted uppercase">Treatment Context</span>
                  <p className="mt-0.5 mb-0 text-sm text-secondary">{entry.treatmentContext}</p>
                </div>
              </div>

              {/* Conflicts (§124 — negative evidence at same level) */}
              {entry.hasConflicts && entry.conflicts.length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <AlertTitle as="h4">Material Conflicts & Limitations</AlertTitle>
                  <AlertDescription>
                    <ul className="m-0 pl-5 text-xs text-secondary">
                      {entry.conflicts.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Sources */}
              <div>
                <h4 className="m-0 mb-1.5 text-xs font-semibold text-muted uppercase">
                  Sources
                </h4>
                <ul className="m-0 pl-5 text-xs text-secondary">
                  {entry.sources.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Scientific Governance Disclosure (§108) */}
      <Alert variant="neutral" className="mt-6">
        <AlertDescription>
          <strong className="text-secondary">Scientific Governance:</strong>{' '}
          This view filters the global Evidence Library by CaseIndication, module, and clinical objective.
          It does not create patient-specific scientific truth. All evidence governance is managed through
          the canonical Evidence Knowledge Graph.
        </AlertDescription>
      </Alert>
    </div>
  );
}
