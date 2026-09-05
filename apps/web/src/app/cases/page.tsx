'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function CasesRegistryPage() {
  const [modeFilter, setModeFilter] = useState<'all' | 'CLINICAL' | 'VALIDATION' | 'RESEARCH'>(
    'all',
  );
  const [indicationFilter, setIndicationFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'awaiting_review' | 'stale' | 'signed'>(
    'all',
  );
  const [search, setSearch] = useState('');
  const allCases = caseStore.getAllCases();

  // Extract unique indications
  const uniqueIndications = Array.from(new Set(allCases.map(c => c.indication))).sort();

  const filteredCases = allCases.filter(c => {
    // Mode filter (§38)
    if (modeFilter !== 'all' && c.mode.toUpperCase() !== modeFilter) return false;

    // Indication filter (§39)
    if (indicationFilter !== 'all' && c.indication !== indicationFilter) return false;

    // State filter
    if (
      stateFilter === 'awaiting_review' &&
      !(c.state === 'target_slate_ready' || c.state === 'phenotype_ready')
    )
      return false;
    if (stateFilter === 'stale' && !c.isStale) return false;
    if (stateFilter === 'signed' && c.state !== 'decision_signed') return false;

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.indication.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Registry Page Header (§28, §152) */}
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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/cases/new" className="btn btn-primary" style={{ fontWeight: 600 }}>
            + Create New Case
          </Link>
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

      {/* Filter and Search Bar (§38–39) */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
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
          {/* Mode Filter (§38) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              MODE:
            </span>
            {(['all', 'CLINICAL', 'VALIDATION', 'RESEARCH'] as const).map(m => (
              <button
                key={m}
                className={`btn ${modeFilter === m ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                onClick={() => setModeFilter(m)}
              >
                {m === 'all' ? 'All Modes' : m}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ minWidth: '240px' }}>
            <input
              type="search"
              className="global-search-input"
              placeholder="Filter cases by code, title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', width: '100%' }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem',
          }}
        >
          {/* Indication Filter (§39) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              INDICATION:
            </span>
            <button
              className={`btn ${indicationFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              onClick={() => setIndicationFilter('all')}
            >
              All
            </button>
            {uniqueIndications.map(ind => (
              <button
                key={ind}
                className={`btn ${indicationFilter === ind ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={() => setIndicationFilter(ind)}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Quick status filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              STATUS:
            </span>
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value as any)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              <option value="all">All Statuses ({allCases.length})</option>
              <option value="awaiting_review">Awaiting Review</option>
              <option value="stale">Stale Slates ({allCases.filter(c => c.isStale).length})</option>
              <option value="signed">Signed</option>
            </select>
          </div>
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
                <th scope="col">Mode</th>
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
                    <span
                      className={`badge ${c.mode.toUpperCase() === 'CLINICAL' ? 'badge-clinical' : c.mode.toUpperCase() === 'RESEARCH' ? 'badge-research' : 'badge-validation'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {c.mode.toUpperCase()}
                    </span>
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
