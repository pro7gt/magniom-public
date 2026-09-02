'use client';

import React from 'react';
import Link from 'next/link';
import { FormativeReviewHarness } from '../../components/formative-review-harness';
import { caseStore } from '../../lib/case-store';
import { getAuthoritativeReleaseContext } from '../../lib/release-authority';

export default function ValidationSuitePage() {
  const releaseContext = getAuthoritativeReleaseContext();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge badge-tier1">
              ENGINEERING & HUMAN-FACTORS VALIDATION
            </span>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
              {releaseContext.buildId}
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            UX Golden Cases Suite & Formative Human-Factors Harness
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.375rem', maxWidth: '850px' }}>
            Dedicated engineering verification environment for testing clinician workflow states, safety mitigations, counterfactual inspectability, and Formative Human-Factors Round 1 critical tasks (IEC 62366-1 / FDA Human Factors Guidance).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              caseStore.resetToGoldenCases();
              window.location.reload();
            }}
            className="btn btn-secondary"
          >
            Reset Store to Golden Cases ↺
          </button>
          <Link href="/cases" className="btn btn-primary">
            Open Case Registry →
          </Link>
        </div>
      </div>

      {/* Interactive Formative Review Harness & Golden Cases Matrix */}
      <FormativeReviewHarness />

      {/* Subsystem Freeze Attestation Manifest Card */}
      <div className="card" style={{ background: '#0a1220', borderColor: '#1e3a5f' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
          Verification Build Baseline Manifest (M3 Frozen)
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Authoritative subsystem digests sealed on {new Date(releaseContext.freezeTimestamp).toLocaleDateString()}.
        </p>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Subsystem</th>
                <th>Version</th>
                <th>SHA-256 Digest</th>
                <th>Status</th>
                <th>Change Control</th>
              </tr>
            </thead>
            <tbody>
              {releaseContext.subsystems.map((sub) => (
                <tr key={sub.subsystemName}>
                  <td><strong>{sub.subsystemName}</strong></td>
                  <td><span className="badge badge-neutral">{sub.version}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                    {sub.sha256DigestFull}
                  </td>
                  <td><span className="badge badge-tier1">{sub.status}</span></td>
                  <td>{sub.isChangeControlLocked ? '🔒 Locked' : 'Unlocked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
