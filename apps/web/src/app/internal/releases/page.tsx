'use client';

import React from 'react';
import Link from 'next/link';
import { getAuthoritativeReleaseContext } from '../../../lib/release-authority';

// ==========================================
// Internal Releases Dashboard (§198)
// Release manifest browser (modules, policies, evidence libraries).
// ==========================================

export default function InternalReleasesPage() {
  const releaseContext = getAuthoritativeReleaseContext();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
        <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>Internal Engineering</span>
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        Release Manifests (§198)
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Authoritative subsystem releases with integrity digests. Never include in ordinary clinician navigation.
      </p>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
          Build: {releaseContext.buildId}
        </h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Subsystem</th>
                <th>Version</th>
                <th>SHA-256</th>
                <th>Status</th>
                <th>Change Control</th>
              </tr>
            </thead>
            <tbody>
              {releaseContext.subsystems.map(sub => (
                <tr key={sub.subsystemName}>
                  <td><strong>{sub.subsystemName}</strong></td>
                  <td><span className="badge badge-neutral">{sub.version}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>{sub.sha256DigestFull}</td>
                  <td><span className="badge badge-tier1">{sub.status}</span></td>
                  <td>{sub.isChangeControlLocked ? '🔒 Locked' : 'Unlocked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link href="/internal/verification" className="btn btn-secondary">← Verification Dashboard</Link>
    </div>
  );
}
