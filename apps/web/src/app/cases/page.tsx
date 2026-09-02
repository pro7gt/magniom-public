'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function CasesRegistryPage() {
  const [filter, setFilter] = useState<'all' | 'mdd' | 'awaiting_review' | 'stale' | 'research'>(
    'all',
  );
  const [search, setSearch] = useState('');
  const allCases = caseStore.getAllCases();

  const filteredCases = allCases.filter(c => {
    // Search query filter
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.indication.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Category filter
    if (filter === 'mdd') return c.indication === 'MDD';
    if (filter === 'awaiting_review')
      return c.state === 'target_slate_ready' || c.state === 'phenotype_ready';
    if (filter === 'stale') return c.isStale;
    if (filter === 'research') return c.title.toLowerCase().includes('research');
    return true;
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Registry Page Header (§28) */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Clinical Case Registry
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Authoritative clinical registry of active TMS target planning cases, indications, and
            workflow states.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href="/validation"
            className="btn btn-secondary"
            title="Open Validation and Golden Cases harness"
          >
            🧪 Golden Cases Suite
          </Link>
          <button
            onClick={() => {
              caseStore.resetToGoldenCases();
              window.location.reload();
            }}
            className="btn btn-secondary"
            title="Reset active in-memory case store to default state"
          >
            Reset Store ↺
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
            onClick={() => setFilter('all')}
          >
            All Cases ({allCases.length})
          </button>
          <button
            className={`btn ${filter === 'awaiting_review' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
            onClick={() => setFilter('awaiting_review')}
          >
            Awaiting Review (3)
          </button>
          <button
            className={`btn ${filter === 'stale' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
            onClick={() => setFilter('stale')}
          >
            Stale Slates ({allCases.filter(c => c.isStale).length})
          </button>
          <button
            className={`btn ${filter === 'mdd' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
            onClick={() => setFilter('mdd')}
          >
            MDD Indication
          </button>
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="search"
            className="global-search-input"
            placeholder="Filter cases by code, title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Cases Registry Table */}
      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Clinical Cases Registry Table">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Case Title / Clinical Hypothesis</th>
                <th scope="col">Indication</th>
                <th scope="col">Lifecycle State</th>
                <th scope="col">Slate Status</th>
                <th scope="col">Clinical Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {c.code}
                    </strong>
                  </td>
                  <td>
                    <div>
                      <strong>{c.title}</strong>
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.125rem',
                      }}
                    >
                      Case ID: {c.id}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{c.indication}</span>
                  </td>
                  <td>
                    <span className="badge badge-tier1">{c.state}</span>
                  </td>
                  <td>
                    {c.isStale ? (
                      <span className="badge badge-tier3">STALE SLATE</span>
                    ) : (
                      <span className="badge badge-tier1">CURRENT</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/cases/${c.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Overview
                      </Link>
                      <Link
                        href={`/cases/${c.id}/targets`}
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Target Slate →
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
