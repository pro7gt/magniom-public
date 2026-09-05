'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function PtsdContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    return caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
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

  const handleConfirmFormulation = () => {
    caseStore.approvePhenotype(
      caseId,
      'clin-specialist-001',
      'PTSD CAPS-5 total 48/80 (Severe), Right DLPFC candidate hypothesis certified',
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="ptsd-context-workspace" style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="PTSD Context Breadcrumb"
        style={{ marginBottom: '16px', fontSize: '0.85rem' }}
      >
        <Link href="/cases" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Cases
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <Link
          href={`/cases/${caseId}`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          {record.clinicalCase.caseCode}
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          PTSD Clinical Formulation
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
              PTSD Symptom Formulation &amp; Battery (§70–§72)
            </h1>
            <span className="badge badge-tier1">CLINICIAN CERTIFIED</span>
            <span className="badge badge-neutral">IMR-PTSD-2.0.0</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Structured diagnostic evaluation: Clinician-Administered PTSD Scale (CAPS-5) &amp; PCL-5
            baseline severity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleConfirmFormulation}
            className="btn btn-primary"
            id="confirm-ptsd-phenotype-btn"
          >
            {isSaved ? '✓ Formulation Sealed' : 'Confirm & Seal Formulation →'}
          </button>
          <Link href={`/cases/${caseId}/trauma-context`} className="btn btn-secondary">
            Trauma Screening →
          </Link>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-secondary">
            Target Slate →
          </Link>
        </div>
      </header>

      {/* 3-Column Diagnostic Card Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Baseline Severity */}
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '1.05rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            CAPS-5 Diagnostic Total
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              48
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              / 80 (Severe PTSD)
            </span>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Criterion B (Intrusions):</span>
              <strong style={{ color: 'var(--text-main)' }}>14 / 20</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Criterion C (Avoidance):</span>
              <strong style={{ color: 'var(--text-main)' }}>7 / 8</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Criterion D (Cognition/Mood):</span>
              <strong style={{ color: 'var(--text-main)' }}>15 / 28</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Criterion E (Hyperarousal):</span>
              <strong style={{ color: 'var(--accent-yellow)' }}>12 / 24</strong>
            </div>
          </div>
        </section>

        {/* Card 2: Scientific Targeting Invariant (§72) */}
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '1.05rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Target Strategy &amp; Laterality Invariant
          </h2>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: '0 0 12px',
            }}
          >
            Conforms to §72: Primary PTSD targeting hypothesis utilizes{' '}
            <strong>Right DLPFC (BA46/9)</strong> inhibitory / high-frequency fronto-limbic
            regulation, distinct from MDD Left DLPFC anti-correlation targeting.
          </p>
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>Governing Evidence Path:</strong>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                marginTop: '2px',
              }}
            >
              EP-PTSD-RDLPFC-CIVILIAN-001
            </div>
            <span className="badge badge-tier1" style={{ marginTop: '6px', fontSize: '0.7rem' }}>
              Level B Clinical Consensus
            </span>
          </div>
        </section>

        {/* Card 3: Comorbidity & MDD Independence (§70) */}
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '1.05rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Comorbidity Isolation Protocol
          </h2>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: '0 0 12px',
            }}
          >
            In accordance with §70, comorbid depressive symptoms remain isolated in independent
            CaseIndication records. Target Slates are never commingled.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Comorbid MDD Status:</span>
              <span className="badge badge-neutral">Independent CaseIndication</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Left-DLPFC Alternative:</span>
              <span className="badge badge-tier2">Secondary Slot (Depressive Focus)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
