'use client';

import React from 'react';
import Link from 'next/link';

// ==========================================
// Target Families Browser (§197)
// Browse TargetFamily entries with evidence governance links.
// ==========================================

const TARGET_FAMILIES = [
  { id: 'TF-MDD-L-DLPFC-001', name: 'Left DLPFC — sgACC Convergent', indication: 'MDD', tier: 'Tier 1', tierBadge: 'badge-tier1', geometryType: 'Point / ROI', claimCount: 3, status: 'Active Clinical' },
  { id: 'TF-MDD-REWARD-001', name: 'Reward Circuit — Anhedonia', indication: 'MDD', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Point', claimCount: 2, status: 'Active Clinical' },
  { id: 'TF-MDD-DMPFC-001', name: 'Dorsomedial PFC — Anxiosomatic', indication: 'MDD', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Point', claimCount: 2, status: 'Active Clinical' },
  { id: 'TF-PAIN-M1-001', name: 'Contralateral M1 — Somatotopic', indication: 'Pain', tier: 'Tier 1', tierBadge: 'badge-tier1', geometryType: 'Somatotopic', claimCount: 2, status: 'Active Clinical' },
  { id: 'TF-STR-M1-001', name: 'Ipsilesional M1 — Motor Recovery', indication: 'Stroke Motor', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Somatotopic', claimCount: 2, status: 'Validation' },
  { id: 'TF-OCD-MPFC-001', name: 'mPFC/ACC — Compulsive Circuit', indication: 'OCD', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Coil-Field', claimCount: 1, status: 'Active Clinical' },
  { id: 'TF-TINN-AUD-001', name: 'Auditory Cortex — Tinnitus', indication: 'Tinnitus', tier: 'Tier Exp', tierBadge: 'badge-tierexp', geometryType: 'Point / ROI', claimCount: 1, status: 'Research Only' },
];

export default function TargetFamiliesPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">EVIDENCE KNOWLEDGE GRAPH</span>
          <span className="badge badge-neutral">Target Families</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Target Families
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Governed anatomical-functional territories from which candidate targets may be derived (§197).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Target Families Registry">
            <thead>
              <tr>
                <th scope="col">Family ID</th>
                <th scope="col">Name</th>
                <th scope="col">Indication</th>
                <th scope="col">Evidence Tier</th>
                <th scope="col">Geometry Type</th>
                <th scope="col">Claims</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {TARGET_FAMILIES.map(tf => (
                <tr key={tf.id}>
                  <td><code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{tf.id}</code></td>
                  <td><strong style={{ fontSize: '0.85rem' }}>{tf.name}</strong></td>
                  <td><span className="badge badge-neutral">{tf.indication}</span></td>
                  <td><span className={`badge ${tf.tierBadge}`}>{tf.tier}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tf.geometryType}</td>
                  <td style={{ textAlign: 'center' }}>{tf.claimCount}</td>
                  <td>
                    <span className={`badge ${tf.status === 'Active Clinical' ? 'badge-tier1' : tf.status === 'Validation' ? 'badge-tier2' : 'badge-tierexp'}`}>
                      {tf.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/evidence" className="btn btn-secondary">← Evidence Library</Link>
        <Link href="/evidence/claims" className="btn btn-secondary">Claims →</Link>
        <Link href="/evidence/paths" className="btn btn-secondary">Evidence Paths →</Link>
        <Link href="/evidence/sources" className="btn btn-secondary">Sources →</Link>
      </div>
    </div>
  );
}
