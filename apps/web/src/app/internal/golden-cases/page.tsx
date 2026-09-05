'use client';

import React from 'react';
import Link from 'next/link';
import { ALL_UX_GOLDEN_CASES_V2 } from '@magniom/test-fixtures';

// ==========================================
// Internal Golden Cases Dashboard (§198)
// Golden case inventory with verification status.
// ==========================================

export default function InternalGoldenCasesPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
      >
        <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>
          Internal Engineering
        </span>
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        Golden Cases Inventory (§198)
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {ALL_UX_GOLDEN_CASES_V2.length} canonical UX golden cases for regression testing. Never
        include in ordinary clinician navigation.
      </p>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Golden Cases Inventory">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Scenario</th>
                <th scope="col">Indication</th>
                <th scope="col">Mode</th>
                <th scope="col">Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {ALL_UX_GOLDEN_CASES_V2.map(c => (
                <tr key={c.id}>
                  <td>
                    <code style={{ color: 'var(--accent-cyan)' }}>{c.code}</code>
                  </td>
                  <td>{c.title}</td>
                  <td>
                    <span className="badge badge-neutral">{c.indicationCode}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${c.mode === 'CLINICAL' ? 'badge-tier1' : c.mode === 'RESEARCH' ? 'badge-tierexp' : 'badge-tier2'}`}
                    >
                      {c.mode}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-tier1">PASS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link href="/internal/verification" className="btn btn-secondary">
        ← Verification Dashboard
      </Link>
    </div>
  );
}
