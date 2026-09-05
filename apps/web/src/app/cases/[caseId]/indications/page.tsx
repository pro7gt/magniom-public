'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caseStore } from '../../../../lib/case-store';

export default function CaseIndicationsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;
  const router = useRouter();

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    return () => unsubscribe();
  }, [caseId]);

  if (!record) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Case ID {caseId} does not exist in the active case store.
        </p>
        <Link href="/cases" className="btn btn-secondary">
          Return to Cases
        </Link>
      </div>
    );
  }

  const activeCiId = record.activeCaseIndicationId;

  const handleSwitchIndication = (ciId: string) => {
    caseStore.switchCaseIndication(caseId, ciId);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    router.refresh();
  };

  return (
    <div className="case-indications-workspace" style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Indications Breadcrumb"
        style={{ marginBottom: '16px', fontSize: '0.85rem' }}
      >
        <Link
          href={`/cases/${caseId}`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          {record.clinicalCase.caseCode}
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          Indication Module Registry
        </span>
      </nav>

      {/* Header */}
      <header
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 700 }}>
            Case Indication Modules (§191–§194)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Multi-indication target governance for patient{' '}
            <strong>{record.clinicalCase.patientId}</strong>. Each indication is validated
            independently under distinct scientific release controls.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}`} className="btn btn-secondary">
            ← Case Overview
          </Link>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-primary">
            Target Slate →
          </Link>
        </div>
      </header>

      {/* Grid of Indication Modules */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {record.availableIndications.map(ind => {
          const isActive = ind.caseIndicationId === activeCiId;

          return (
            <article
              key={ind.caseIndicationId}
              style={{
                backgroundColor: isActive
                  ? 'rgba(56, 189, 248, 0.06)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.15)' : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        color: 'var(--text-main)',
                        fontWeight: 700,
                      }}
                    >
                      {ind.label}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {ind.caseIndicationId} · IMR-{ind.indicationCode}-2.0.0
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {ind.isPrimary && <span className="badge badge-tier1">Primary</span>}
                    {isActive ? (
                      <span
                        className="badge badge-tier1"
                        style={{ backgroundColor: 'var(--accent-cyan)', color: '#000' }}
                      >
                        ACTIVE
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Inactive</span>
                    )}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    margin: '0 0 16px',
                  }}
                >
                  Status: <strong>{ind.status}</strong>. Full scientific policy configuration and
                  indication-specific measurements are active for this patient record.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {!isActive ? (
                  <button
                    onClick={() => handleSwitchIndication(ind.caseIndicationId)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Activate {ind.indicationCode} Module
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ✓ Currently Governing Targeting
                  </span>
                )}
                <Link
                  href={`/cases/${caseId}/indications/${ind.caseIndicationId}`}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  Indication View →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
