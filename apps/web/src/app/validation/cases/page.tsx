'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../../../lib/case-store';

// ==========================================
// Validation Cases (§196)
// Validation case list filtered by study protocol.
// ==========================================

export default function ValidationCasesPage() {
  const allCases = caseStore.getAllCases();
  const validationCases = allCases.filter(
    c =>
      c.mode === 'VALIDATION' ||
      c.title.toLowerCase().includes('validation') ||
      c.title.toLowerCase().includes('prospective') ||
      c.code === 'MGN-26-0052',
  );

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="safety-strip safety-strip-validation" style={{ margin: 0 }}>
        <strong>VALIDATION ENVIRONMENT (§196):</strong> All cases below operate under controlled study
        protocols. Blinded evaluation rules strictly enforced.
      </div>

      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier2">VALIDATION ENVIRONMENT</span>
          <span className="badge badge-neutral">Case Registry</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Validation Cases
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Enrolled cohort cases governed by formal validation study protocols (§196, §217–§227).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Validation Cases">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Indication</th>
                <th scope="col">Study / Protocol</th>
                <th scope="col">Blinding Status</th>
                <th scope="col">State</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {validationCases.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {c.code}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{c.indication}</span>
                  </td>
                  <td>
                    <strong>{c.title}</strong>
                  </td>
                  <td>
                    <span className="badge badge-tier2">Silent Prospective (Blinded)</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <span className="badge badge-tier1">{c.state}</span>
                  </td>
                  <td>
                    <Link
                      href={`/cases/${c.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Open Case →
                    </Link>
                  </td>
                </tr>
              ))}
              {validationCases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No validation cases currently enrolled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/validation" className="btn btn-secondary">← Validation Home</Link>
        <Link href="/validation/studies" className="btn btn-secondary">Studies →</Link>
        <Link href="/validation/golden" className="btn btn-secondary">Golden Cases →</Link>
      </div>
    </div>
  );
}

