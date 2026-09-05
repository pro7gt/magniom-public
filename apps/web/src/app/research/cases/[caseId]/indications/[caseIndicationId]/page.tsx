'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../../../lib/case-store';

export default function ResearchCaseIndicationPage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const resolvedParams = use(params);
  const { caseId, caseIndicationId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
  }, [caseId]);

  if (!record) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Research Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Case ID {caseId} does not exist in the research registry.
        </p>
        <Link href="/research/cases" className="btn btn-secondary">
          Return to Research Cases
        </Link>
      </div>
    );
  }

  const ind =
    record.availableIndications.find(i => i.caseIndicationId === caseIndicationId) ||
    record.availableIndications[0]!;

  return (
    <div className="research-case-indication-workspace" style={{ padding: '24px' }}>
      {/* Research Mode Persistent Safety Banner (§20–25, §57) */}
      <div
        className="safety-strip safety-strip-research"
        style={{
          backgroundColor: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🔬</span>
        <div>
          <strong style={{ color: 'var(--accent-yellow)', fontSize: '0.85rem' }}>
            RESEARCH ENVIRONMENT: EXPLORATORY NEUROIMAGING WORKSPACE (§195)
          </strong>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Clinical decision sign-off and treatment prescription are strictly locked. All targeting
            outputs represent exploratory computational hypotheses.
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav aria-label="Research Breadcrumb" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
        <Link href="/research" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Research
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <Link
          href="/research/cases"
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          Research Cases
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          {record.clinicalCase.caseCode} · {ind.indicationCode}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 700 }}
            >
              {ind.label} Research Analysis
            </h1>
            <span className="badge badge-tierexp">RESEARCH MODE</span>
            <span className="badge badge-neutral">{caseIndicationId}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Subject Token: <strong>SUBJ-{record.clinicalCase.patientId}</strong> · Protocol:
            Retrospective Connectome Mapping
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-secondary">
            View Target Hypotheses →
          </Link>
          <Link href="/research/cases" className="btn btn-secondary">
            All Research Cases
          </Link>
        </div>
      </header>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Research Target Invariants
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Module Release:</span>
              <strong style={{ color: 'var(--text-main)' }}>IMR-{ind.indicationCode}-2.0.0</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Qualification Gate:</span>
              <strong style={{ color: 'var(--accent-yellow)' }}>Q0 (Exploratory / Research)</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Clinical Decision:</span>
              <strong style={{ color: 'var(--accent-red)' }}>Strictly Suppressed (§57)</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Export Format:</span>
              <strong style={{ color: 'var(--text-main)' }}>Anonymized NIfTI Hypotheses</strong>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
