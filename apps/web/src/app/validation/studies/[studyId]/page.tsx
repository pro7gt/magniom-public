'use client';

import React, { use } from 'react';
import Link from 'next/link';

interface StudyRecord {
  id: string;
  title: string;
  module: string;
  protocol: string;
  participants: number;
  status: string;
  phase: string;
  description: string;
  primaryEndpoint: string;
}

const STUDIES: Record<string, StudyRecord> = {
  'VS-MDD-SILENT-001': {
    id: 'VS-MDD-SILENT-001',
    title: 'MDD Silent Prospective Study (Double-Blind)',
    module: 'MDD Indication Module 2.0',
    protocol: 'Silent Prospective Blinding Q5',
    participants: 42,
    status: 'Active',
    phase: 'Enrollment',
    description: 'Double-blind evaluation comparing clinical outcomes of clinician-selected TMS targets against MAGNIOM connectome-derived targets without unblinding during treatment course.',
    primaryEndpoint: 'MADRS reduction at Week 6 with blinding retention verification.',
  },
  'VS-PAIN-CAV-001': {
    id: 'VS-PAIN-CAV-001',
    title: 'Neuropathic Pain Clinician-Assisted Validation',
    module: 'Pain Indication Module 1.0',
    protocol: 'Clinician-Assisted Formative Q6',
    participants: 18,
    status: 'Active',
    phase: 'Data Collection',
    description: 'Formative human-factors evaluation of somatotopic homunculus coil positioning for intractable focal neuropathic pain.',
    primaryEndpoint: 'NRS pain score delta and motor threshold stability.',
  },
  'VS-STR-MOTOR-001': {
    id: 'VS-STR-MOTOR-001',
    title: 'Stroke Motor Module Validation',
    module: 'Stroke Motor Indication Module 1.0',
    protocol: 'Standard Multi-Center Q5',
    participants: 24,
    status: 'Planning',
    phase: 'Protocol Design',
    description: 'Subacute stroke motor rehabilitation protocol evaluating ipsilesional M1 stimulation in the presence of cortical lesions.',
    primaryEndpoint: 'Fugl-Meyer Upper Extremity (FMA-UE) change at 30 days post-stimulation.',
  },
};

export default function ValidationStudyDetailPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const resolvedParams = use(params);
  const studyId = resolvedParams.studyId;
  const study = STUDIES[studyId] || {
    id: studyId,
    title: `Validation Study ${studyId}`,
    module: 'MAGNIOM Module',
    protocol: 'Controlled Validation Protocol',
    participants: 10,
    status: 'Active',
    phase: 'Data Collection',
    description: 'Controlled clinical validation study protocol.',
    primaryEndpoint: 'Target reproducibility and safety adherence.',
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Breadcrumbs */}
      <nav aria-label="Study Breadcrumb" style={{ fontSize: '0.85rem' }}>
        <Link href="/validation" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Validation
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <Link href="/validation/studies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Studies
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{study.id}</span>
      </nav>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier2">VALIDATION ENVIRONMENT</span>
          <span className="badge badge-neutral">{study.id}</span>
          <span className="badge badge-tier1">{study.status}</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {study.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {study.description}
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
            Protocol Specifications (§196)
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Governing Module:</span>
              <strong>{study.module}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protocol Classification:</span>
              <span className="badge badge-tier2">{study.protocol}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Phase:</span>
              <strong>{study.phase}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Enrolled Participants:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{study.participants} subjects</strong>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
            Endpoints &amp; Governance
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
            <strong>Primary Endpoint:</strong> {study.primaryEndpoint}
          </p>
          <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem' }}>
            <strong>Safety Notice (§196):</strong> Validation routes operate under protocol governance. Clinical decision signing is locked for blinded arms.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/validation/studies" className="btn btn-secondary">← All Studies</Link>
        <Link href="/validation/cases" className="btn btn-secondary">Validation Cases →</Link>
        <Link href="/validation/golden" className="btn btn-secondary">Golden Cases →</Link>
      </div>
    </div>
  );
}
