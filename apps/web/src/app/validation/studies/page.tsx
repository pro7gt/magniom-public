'use client';

import React from 'react';
import Link from 'next/link';

// ==========================================
// Validation Studies (§196)
// Validation study listing with protocol status.
// Not available to ordinary Clinical users unless required.
// ==========================================

const VALIDATION_STUDIES = [
  { id: 'VS-MDD-SILENT-001', title: 'MDD Silent Prospective Study', module: 'MDD Module 2.0', protocol: 'Silent Prospective Q5', participants: 42, status: 'Active', phase: 'Enrollment' },
  { id: 'VS-PAIN-CAV-001', title: 'Neuropathic Pain Clinician-Assisted Validation', module: 'Pain Module 1.0', protocol: 'Clinician-Assisted Q6', participants: 18, status: 'Active', phase: 'Data Collection' },
  { id: 'VS-STR-MOTOR-001', title: 'Stroke Motor Module Validation', module: 'Stroke Motor 1.0', protocol: 'Standard Q5', participants: 24, status: 'Planning', phase: 'Protocol Design' },
];

export default function ValidationStudiesPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier2">VALIDATION ENVIRONMENT</span>
          <span className="badge badge-neutral">Study Registry</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Validation Studies
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Controlled validation studies under study protocol governance. Clinical authority restricted by protocol (§196).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Validation Studies">
            <thead>
              <tr>
                <th scope="col">Study ID</th>
                <th scope="col">Title</th>
                <th scope="col">Module</th>
                <th scope="col">Protocol</th>
                <th scope="col">Participants</th>
                <th scope="col">Phase</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {VALIDATION_STUDIES.map(s => (
                <tr key={s.id}>
                  <td><code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{s.id}</code></td>
                  <td><strong style={{ fontSize: '0.85rem' }}>{s.title}</strong></td>
                  <td style={{ fontSize: '0.85rem' }}>{s.module}</td>
                  <td><span className="badge badge-tier2" style={{ fontSize: '0.75rem' }}>{s.protocol}</span></td>
                  <td style={{ textAlign: 'center' }}>{s.participants}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.phase}</td>
                  <td>
                    <span className={`badge ${s.status === 'Active' ? 'badge-tier1' : 'badge-neutral'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/validation" className="btn btn-secondary">← Validation Home</Link>
        <Link href="/validation/cases" className="btn btn-secondary">Validation Cases →</Link>
        <Link href="/validation/modules" className="btn btn-secondary">Module Qualification →</Link>
        <Link href="/validation/golden" className="btn btn-secondary">Golden Cases →</Link>
      </div>
    </div>
  );
}
