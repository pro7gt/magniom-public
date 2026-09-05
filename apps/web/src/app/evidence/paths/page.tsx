'use client';

import React from 'react';
import Link from 'next/link';

// ==========================================
// Evidence Paths Browser (§197)
// Visualisation of the governed path from Indication → Claim → Circuit → TargetFamily → Candidate.
// ==========================================

const EVIDENCE_PATHS = [
  {
    id: 'EP-MDD-CONVERGENT',
    nodes: [
      { type: 'INDICATION', label: 'Major Depressive Disorder', description: 'DSM-5 / ICD-11 criteria with treatment resistance' },
      { type: 'CLAIM', label: 'sgACC Anti-Correlation Claim', description: 'Antidepressant response ∝ functional connectivity to BA25' },
      { type: 'CIRCUIT', label: 'sgACC-DLPFC Convergent Circuit', description: 'Subgenual cingulate to fronto-parietal network' },
      { type: 'TARGET_FAMILY', label: 'Left DLPFC (TF-MDD-L-DLPFC-001)', description: 'Prefrontal territory spanning BA9/BA46' },
      { type: 'CANDIDATE', label: 'Connectivity-Refined Coordinate', description: 'Patient-specific FC refinement from evidence baseline' },
    ],
  },
  {
    id: 'EP-MDD-REWARD',
    nodes: [
      { type: 'INDICATION', label: 'Major Depressive Disorder', description: 'With prominent anhedonia' },
      { type: 'CLAIM', label: 'Reward Circuit Modulation Claim', description: 'Ventromedial–striatal circuit addresses anhedonic burden' },
      { type: 'CIRCUIT', label: 'Reward / Striatal-mPFC Circuit', description: 'Motivational network architecture' },
      { type: 'TARGET_FAMILY', label: 'Reward Circuit (TF-MDD-REWARD-001)', description: 'Dorsomedial PFC / reward modulation territory' },
      { type: 'CANDIDATE', label: 'Symptom-Circuit Target', description: 'Anhedonia-specific FC-guided target' },
    ],
  },
  {
    id: 'EP-PAIN-SOMATOTOPIC',
    nodes: [
      { type: 'INDICATION', label: 'Neuropathic Pain', description: 'Intractable chronic neuropathic pain' },
      { type: 'CLAIM', label: 'Contralateral M1 Pain Reduction', description: 'Motor cortex stimulation reduces pain via descending inhibition' },
      { type: 'CIRCUIT', label: 'Cortico-Thalamic Pain Modulation', description: 'M1 to thalamic relay circuit' },
      { type: 'TARGET_FAMILY', label: 'Contralateral M1 (TF-PAIN-M1-001)', description: 'Somatotopic motor representation' },
      { type: 'CANDIDATE', label: 'Motor-Map Refined Target', description: 'Patient-specific somatotopic refinement' },
    ],
  },
];

const NODE_COLOURS: Record<string, string> = {
  INDICATION: '#818cf8',
  CLAIM: '#38bdf8',
  CIRCUIT: '#34d399',
  TARGET_FAMILY: '#fbbf24',
  CANDIDATE: '#f87171',
};

export default function EvidencePathsPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">EVIDENCE KNOWLEDGE GRAPH</span>
          <span className="badge badge-neutral">Evidence Paths</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Evidence Paths
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Governed scientific pathways from Indication → Claim → Circuit → TargetFamily → Candidate (§197).
          Each path represents a traceable, governed chain of scientific justification.
        </p>
      </div>

      {EVIDENCE_PATHS.map(path => (
        <div key={path.id} className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <code style={{ color: 'var(--accent-cyan)', marginRight: '8px' }}>{path.id}</code>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {path.nodes.map((node, idx) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${NODE_COLOURS[node.type] || '#64748b'}`,
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${NODE_COLOURS[node.type]}22`,
                      color: NODE_COLOURS[node.type],
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      minWidth: '110px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {node.type.replace('_', ' ')}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{node.label}</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {node.description}
                    </p>
                  </div>
                </div>
                {idx < path.nodes.length - 1 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2px 0' }}>
                    ↓
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/evidence" className="btn btn-secondary">← Evidence Library</Link>
        <Link href="/evidence/claims" className="btn btn-secondary">Claims →</Link>
        <Link href="/evidence/target-families" className="btn btn-secondary">Target Families →</Link>
      </div>
    </div>
  );
}
