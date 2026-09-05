'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function ReviewsWorklistPage() {
  const allCases = caseStore.getAllCases();
  const queueCases = allCases.filter(
    c => c.state === 'target_slate_ready' || c.state === 'phenotype_ready' || c.isStale,
  );

  return (
    <div
      className="container"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '24px' }}
    >
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
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '4px 0',
            }}
          >
            Clinician Review &amp; Sign-Off Worklist (§190)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Active cases requiring clinical phenotype approval, target slate comparison, or
            electronic decision sign-off.
          </p>
        </div>
        <div>
          <Link href="/cases" className="btn btn-secondary">
            All Cases Registry
          </Link>
        </div>
      </div>

      <div
        className="card"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '16px' }}
      >
        <div className="comparison-table-wrapper">
          <table
            className="comparison-table"
            style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}
            aria-label="Awaiting Review Cases Table"
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th scope="col" style={{ padding: '12px' }}>
                  Case Code
                </th>
                <th scope="col" style={{ padding: '12px' }}>
                  Indication
                </th>
                <th scope="col" style={{ padding: '12px' }}>
                  Pending Review Task
                </th>
                <th scope="col" style={{ padding: '12px' }}>
                  Status
                </th>
                <th scope="col" style={{ padding: '12px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {queueCases.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    <Link
                      href={`/cases/${c.id}`}
                      style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
                    >
                      {c.code}
                    </Link>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-neutral">{c.indication}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                    {c.isStale
                      ? 'Stale Slate Regeneration Required'
                      : c.state === 'phenotype_ready'
                        ? 'Phenotype Approval Pending'
                        : 'Target Slate Decision Required'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {c.isStale ? (
                      <span className="badge badge-tier3">Stale</span>
                    ) : (
                      <span className="badge badge-tier2">Action Req</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link
                      href={`/cases/${c.id}/targets`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Review Targets →
                    </Link>
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
