'use client';

import React from 'react';
import Link from 'next/link';

// ==========================================
// Internal CI/CD Status Dashboard (§198)
// CI/CD pipeline status for engineering teams.
// ==========================================

export default function InternalCIStatusPage() {
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
        CI/CD Pipeline Status (§198)
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Continuous integration and deployment pipeline monitoring. Safety-relevant UX changes
        trigger expanded regression and human-factors impact assessment (§269).
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}
          >
            Build Status
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            PASS
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            All pipelines green
          </span>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}
          >
            Test Coverage
          </span>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--accent-cyan)',
              marginTop: '4px',
            }}
          >
            94.2%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Shell + Authority + Domain
          </span>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}
          >
            Visual Regression
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            0 Diffs
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Safety-critical snapshots
          </span>
        </div>
      </div>

      <Link href="/internal/verification" className="btn btn-secondary">
        ← Verification Dashboard
      </Link>
    </div>
  );
}
