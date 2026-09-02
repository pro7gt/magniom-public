'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function AwaitingReviewPage() {
  const allCases = caseStore.getAllCases();
  const queueCases = allCases.filter(
    c => c.state === 'target_slate_ready' || c.state === 'phenotype_ready' || c.isStale,
  );

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              marginBottom: '0.25rem',
            }}
          >
            <span className="badge badge-tier3">ACTIONABLE QUEUE</span>
            <span className="badge badge-neutral">{queueCases.length} Cases Pending</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Awaiting Specialist Clinician Review
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Cases requiring phenotype confirmation, target candidate evaluation, or stale slate
            regeneration before signing.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Awaiting Review Cases Table">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Clinical Case Title</th>
                <th scope="col">Pending Review Task</th>
                <th scope="col">Priority</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queueCases.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {c.code}
                    </strong>
                  </td>
                  <td>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {c.indication}
                    </div>
                  </td>
                  <td>
                    {c.isStale ? (
                      <span className="badge badge-tier3">Stale Slate Regeneration</span>
                    ) : c.state === 'phenotype_ready' ? (
                      <span className="badge badge-tier2">Phenotype Approval Required</span>
                    ) : (
                      <span className="badge badge-tier1">Target Slate Review Ready</span>
                    )}
                  </td>
                  <td>
                    {c.isStale ? (
                      <span className="badge badge-tierexp">URGENT</span>
                    ) : (
                      <span className="badge badge-neutral">NORMAL</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/cases/${c.id}/targets`}
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Enter Review →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
