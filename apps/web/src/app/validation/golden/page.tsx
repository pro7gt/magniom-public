'use client';

import React from 'react';
import Link from 'next/link';
import { ALL_UX_GOLDEN_CASES_V2 } from '@magniom/test-fixtures';

// ==========================================
// Golden Cases Verification (§196, §250–262)
// Golden case verification status dashboard.
// ==========================================

export default function GoldenCasesPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier2">VALIDATION ENVIRONMENT</span>
          <span className="badge badge-neutral">Golden Cases</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          UX Golden Cases
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Canonical test fixtures for shell verification, human-factors testing, and safety invariant regression (§250–262).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Golden Cases">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Scenario</th>
                <th scope="col">Indication</th>
                <th scope="col">Mode</th>
                <th scope="col">Safety Invariant</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {ALL_UX_GOLDEN_CASES_V2.map(c => (
                <tr key={c.id}>
                  <td><strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{c.code}</strong></td>
                  <td>{c.title}</td>
                  <td><span className="badge badge-neutral">{c.indicationCode}</span></td>
                  <td>
                    <span className={`badge ${c.mode === 'CLINICAL' ? 'badge-tier1' : c.mode === 'RESEARCH' ? 'badge-tierexp' : 'badge-tier2'}`}>
                      {c.mode}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {c.isStale ? 'Blocking Staleness' : c.isContradictory ? 'Fail-Closed' : c.isBlindedValidation ? 'Silent Prospective' : c.mode === 'RESEARCH' ? 'Signing Prohibited' : 'Standard'}
                  </td>
                  <td>
                    <Link href={`/cases/${c.id}`} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/validation" className="btn btn-secondary">← Validation Home</Link>
        <Link href="/validation/studies" className="btn btn-secondary">Studies →</Link>
        <Link href="/validation/modules" className="btn btn-secondary">Module Qualification →</Link>
      </div>
    </div>
  );
}
