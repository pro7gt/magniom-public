'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ==========================================
// Evidence Claims Browser (§197)
// Browse approved evidence claims filtered by indication,
// tier, and governance status.
// ==========================================

const CANONICAL_CLAIMS = [
  {
    id: 'CLM-MDD-SGACC-001',
    title: 'sgACC Anti-Correlation Efficacy Claim',
    indication: 'MDD',
    tier: 'T1',
    tierLabel: 'Tier 1 — Established',
    tierBadge: 'badge-tier1',
    statement: 'Antidepressant response scales with functional connectivity to Brodmann area 25 (subgenual anterior cingulate cortex).',
    governanceStatus: 'Approved',
    lastReviewed: '2026-06-15',
    sourceCount: 12,
  },
  {
    id: 'CLM-MDD-REWARD-001',
    title: 'Reward Circuit Anhedonia Claim',
    indication: 'MDD',
    tier: 'T2',
    tierLabel: 'Tier 2 — Prospectively Supported',
    tierBadge: 'badge-tier2',
    statement: 'Ventromedial–striatal circuit modulation addresses anhedonic symptom burden.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-07-01',
    sourceCount: 6,
  },
  {
    id: 'CLM-PAIN-M1-001',
    title: 'Contralateral M1 Neuropathic Pain Claim',
    indication: 'Pain',
    tier: 'T1',
    tierLabel: 'Tier 1 — Established',
    tierBadge: 'badge-tier1',
    statement: 'Contralateral primary motor cortex stimulation reduces neuropathic pain intensity via descending inhibitory modulation.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-08-01',
    sourceCount: 9,
  },
  {
    id: 'CLM-STR-M1-001',
    title: 'Ipsilesional M1 Motor Recovery Claim',
    indication: 'Stroke Motor',
    tier: 'T2',
    tierLabel: 'Tier 2 — Prospectively Supported',
    tierBadge: 'badge-tier2',
    statement: 'Excitatory stimulation of ipsilesional M1 enhances motor recovery when combined with rehabilitation.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-07-20',
    sourceCount: 7,
  },
  {
    id: 'CLM-OCD-MPFC-001',
    title: 'mPFC/ACC Field Stimulation OCD Claim',
    indication: 'OCD',
    tier: 'T2',
    tierLabel: 'Tier 2 — Prospectively Supported',
    tierBadge: 'badge-tier2',
    statement: 'Medial prefrontal / anterior cingulate field stimulation modulates compulsive behaviour circuitry.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-06-28',
    sourceCount: 5,
  },
  {
    id: 'CLM-TINNITUS-AUD-001',
    title: 'Auditory Cortex Tinnitus Hypothesis',
    indication: 'Tinnitus',
    tier: 'T_EXP',
    tierLabel: 'Tier Exp — Research Only',
    tierBadge: 'badge-tierexp',
    statement: 'Auditory cortex inhibitory stimulation may reduce tinnitus perception — evidence remains conflicting.',
    governanceStatus: 'Research Review',
    lastReviewed: '2026-08-15',
    sourceCount: 4,
  },
];

export default function EvidenceClaimsPage() {
  const [indicationFilter, setIndicationFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const indications = Array.from(new Set(CANONICAL_CLAIMS.map(c => c.indication)));
  const filtered = CANONICAL_CLAIMS.filter(c => {
    if (indicationFilter !== 'all' && c.indication !== indicationFilter) return false;
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">EVIDENCE KNOWLEDGE GRAPH</span>
          <span className="badge badge-neutral">Claims Registry</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Evidence Claims
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Approved scientific claims governing target family eligibility. Each claim is independently governed and version-controlled (§197).
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Indication:</label>
          <select
            value={indicationFilter}
            onChange={e => setIndicationFilter(e.target.value)}
            style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
          >
            <option value="all">All Indications</option>
            {indications.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tier:</label>
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
          >
            <option value="all">All Tiers</option>
            <option value="T1">Tier 1 — Established</option>
            <option value="T2">Tier 2 — Prospectively Supported</option>
            <option value="T3">Tier 3 — Retrospectively Supported</option>
            <option value="T_EXP">Tier Exp — Research Only</option>
          </select>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {CANONICAL_CLAIMS.length} claims
        </span>
      </div>

      {/* Claims Table */}
      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Evidence Claims Registry">
            <thead>
              <tr>
                <th scope="col">Claim ID</th>
                <th scope="col">Indication</th>
                <th scope="col">Claim Title</th>
                <th scope="col">Evidence Tier</th>
                <th scope="col">Governance</th>
                <th scope="col">Sources</th>
                <th scope="col">Last Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(claim => (
                <tr key={claim.id}>
                  <td>
                    <code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{claim.id}</code>
                  </td>
                  <td><span className="badge badge-neutral">{claim.indication}</span></td>
                  <td>
                    <strong style={{ fontSize: '0.85rem' }}>{claim.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {claim.statement}
                    </div>
                  </td>
                  <td><span className={`badge ${claim.tierBadge}`}>{claim.tierLabel}</span></td>
                  <td>
                    <span className={`badge ${claim.governanceStatus === 'Approved' ? 'badge-tier1' : 'badge-tierexp'}`}>
                      {claim.governanceStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{claim.sourceCount}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{claim.lastReviewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/evidence" className="btn btn-secondary">← Evidence Library</Link>
        <Link href="/evidence/paths" className="btn btn-secondary">Evidence Paths →</Link>
        <Link href="/evidence/target-families" className="btn btn-secondary">Target Families →</Link>
        <Link href="/evidence/sources" className="btn btn-secondary">Sources →</Link>
      </div>
    </div>
  );
}
