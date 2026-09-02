'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function DecisionsPage() {
  const allCases = caseStore.getAllCases();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">CLINICAL DECISION GOVERNANCE</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Clinical Decisions & Cryptographic Sign-Off History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Authoritative record of clinician-authored target selections, clinical justifications, and immutable SHA-256 digital signatures.
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Decisions History Table">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Case Title</th>
                <th scope="col">Indication</th>
                <th scope="col">Decision State</th>
                <th scope="col">Signing Authority</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {allCases.map((c) => {
                const record = caseStore.getCaseRecord(c.id);
                const isSigned = Boolean(record?.decision?.isImmutable);

                return (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {c.code}
                      </strong>
                    </td>
                    <td>{c.title}</td>
                    <td>
                      <span className="badge badge-neutral">{c.indication}</span>
                    </td>
                    <td>
                      {isSigned ? (
                        <span className="badge badge-tier1">Signed & Sealed (SHA-256)</span>
                      ) : (
                        <span className="badge badge-tier3">Unsigned / In Formulation</span>
                      )}
                    </td>
                    <td>
                      {isSigned
                        ? record?.decision?.attestation?.clinicianName || 'Dr A. Smith'
                        : 'Pending Attestation'}
                    </td>
                    <td>
                      <Link
                        href={`/cases/${c.id}/decision`}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {isSigned ? 'Inspect Record →' : 'Begin Decision →'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
