'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function AuditPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const record = caseStore.getCaseRecord(caseId);

  if (!record) {
    return <div className="container">Case not found.</div>;
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Cryptographic Audit Log & Decision Hash Verification
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Tamper-evident chronological audit trail for clinical governance and regulatory compliance (IEC 62304 / ISO 14971).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/cases/${caseId}/decision`} className="btn btn-secondary">
            ← Return to Decision
          </Link>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-primary">
            Target Slate Workspace →
          </Link>
        </div>
      </div>

      {/* Decision Integrity Summary Card */}
      <div className="card" style={{ background: '#0a1424', borderColor: '#1e3a5f' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
          Cryptographic Integrity & Digital Signature Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Phenotype Snapshot Hash:</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '0.25rem' }}>
              {record.phenotype.snapshotHash || 'Not Sealed (Draft)'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Target Slate Manifest Hash:</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', marginTop: '0.25rem' }}>
              {record.slate.deterministicManifestHash}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Decision Digital Signature Hash:</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: record.decision?.isImmutable ? '#fbbf24' : 'var(--text-muted)', marginTop: '0.25rem' }}>
              {record.decision?.digitalSignatureHash || 'Awaiting Specialist Signature'}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Event Timeline */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Chronological Audit Event Stream
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {record.auditEvents.map((evt, idx) => (
            <div
              key={evt.id}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                padding: '0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-neutral">#{idx + 1}</span>
                  <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.875rem' }}>{evt.eventType}</strong>
                </div>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.5rem', background: '#090d16', padding: '0.5rem', borderRadius: '0.25rem', overflowX: 'auto' }}>
                  {JSON.stringify(evt.details, null, 2)}
                </pre>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                {new Date(evt.occurredAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
