'use client';

import React from 'react';
import Link from 'next/link';

// ==========================================
// Internal Scientific Policy Dashboard (§198)
// Scientific policy configuration viewer.
// ==========================================

export default function InternalScientificPolicyPage() {
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
        Scientific Policy Configuration (§198)
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Active scientific policies governing module behaviour, evidence eligibility, and target
        ranking parameters. Never include in ordinary clinician navigation.
      </p>

      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Scientific policy administration is managed through the controlled governance workflow.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
          Active policies are resolved server-side and cannot be modified through the frontend
          interface. Policy changes require requirements impact review, risk review, and regression
          testing (§3).
        </p>
      </div>

      <Link href="/internal/verification" className="btn btn-secondary">
        ← Verification Dashboard
      </Link>
    </div>
  );
}
