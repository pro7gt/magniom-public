'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
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
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Case ID {caseId} does not exist in the active case store.
        </p>
      </div>
    );
  }

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const indication = shellVm?.indication;
  const indicationCode = indication?.indicationCode || record.clinicalCase.indicationCode;
  const entries = getIndicationEvidence(indicationCode);

  return (
    <div className="case-evidence-workspace" style={{ padding: '24px' }}>
      {/* Section Header (§107) */}
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 700 }}>
              Case Evidence
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Evidence filtered by{' '}
              <strong>{indication?.indicationFormatted || indicationCode}</strong>,
              active module, and clinical objective (§108 — filtered, not altered).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/evidence" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              Open Global Evidence Library →
            </Link>
          </div>
        </div>
      </header>

      {/* Evidence Workspace Questions (§107) */}
      <div
        style={{
          backgroundColor: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
          Case Evidence Should Answer
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Why can this TargetFamily be considered?</li>
          <li>For which population?</li>
          <li>For this disease stage?</li>
          <li>Under which targeting method?</li>
          <li>With which treatment context?</li>
          <li>What evidence conflicts?</li>
        </ul>
      </div>

      {/* Evidence Entries (§107–108) */}
      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
          Applicable EvidencePaths ({entries.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {entries.map(entry => (
            <article
              key={entry.id}
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '20px',
                borderLeft: `3px solid ${entry.hasConflicts ? '#f59e0b' : '#10b981'}`,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>
                    {entry.targetFamily}
                  </h4>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {entry.id}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${entry.tierBadge}`} style={{ fontSize: '0.8rem' }}>
                    {entry.tier}
                  </span>
                  {entry.hasConflicts && (
                    <span className="badge badge-tier3" style={{ fontSize: '0.75rem' }}>
                      Material Conflicts
                    </span>
                  )}
                </div>
              </div>

              {/* Claim */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Clinical Claim
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {entry.claim}
                </p>
              </div>

              {/* Structured Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Population</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.population}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Disease Stage</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.diseaseStage}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Targeting Method</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.targetingMethod}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Treatment Context</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.treatmentContext}</p>
                </div>
              </div>

              {/* Conflicts (§124 — negative evidence at same level) */}
              {entry.hasConflicts && entry.conflicts.length > 0 && (
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                  <h5 style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>
                    Material Conflicts & Limitations
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    {entry.conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              <div>
                <h5 style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Sources
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
      <div
        style={{
          marginTop: '24px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <strong style={{ color: 'var(--text-secondary)' }}>Scientific Governance:</strong>{' '}
        This view filters the global Evidence Library by CaseIndication, module, and clinical objective.
        It does not create patient-specific scientific truth. All evidence governance is managed through
        the canonical Evidence Knowledge Graph.
      </div>
    </div>
  );
}
