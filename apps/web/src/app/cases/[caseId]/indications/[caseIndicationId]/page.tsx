'use client';

import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../../lib/case-store';
import { getModuleUiDescriptor } from '@magniom/presentation';

export default function CaseIndicationOverviewPage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const resolvedParams = use(params);
  const { caseId, caseIndicationId } = resolvedParams;

  const record = caseStore.getCaseRecord(caseId);

  useEffect(() => {
    if (record && record.activeCaseIndicationId !== caseIndicationId) {
      caseStore.switchCaseIndication(caseId, caseIndicationId);
    }
  }, [caseId, caseIndicationId, record]);

  if (!record) {
    return <div className="container">Case not found.</div>;
  }

  const descriptor = getModuleUiDescriptor(record.clinicalCase.indicationCode);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Indication Orientation Banner (§63) */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderColor: '#334155',
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
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
              }}
            >
              INDICATION WORKSPACE CONTEXT
            </span>
            <h1
              style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}
            >
              {descriptor.indication_name}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Case Code:{' '}
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {record.clinicalCase.caseCode}
              </strong>{' '}
              • Module: <strong>{descriptor.indication_module_release_id}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href={`/cases/${caseId}/targets`}
              className="btn btn-primary"
              id="review-target-slate-overview-btn"
            >
              Enter Target Workspace →
            </Link>
          </div>
        </div>
      </div>

      {/* Indication Clinical Question & Measurements */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            CLINICAL OBJECTIVE
          </span>
          <h3 style={{ marginTop: '0.5rem', color: '#fff' }}>
            {record.clinicalObjective?.title ||
              `Targeting for ${record.clinicalCase.indicationCode}`}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {record.clinicalObjective?.burdenScoreText
              ? `Current baseline burden: ${record.clinicalObjective.burdenScoreText}`
              : 'Clinical formulation active for this indication.'}
          </p>
        </div>

        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            REQUIRED MEASUREMENTS
          </span>
          <ul
            style={{
              marginTop: '0.5rem',
              paddingLeft: '1.25rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
            }}
          >
            {descriptor.measurement_sections.map(ms => (
              <li key={ms.modality}>
                {ms.label} {ms.required ? '(Required)' : '(Optional / Research)'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
