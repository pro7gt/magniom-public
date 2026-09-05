'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';
import { toPhenotypeViewModel } from '@magniom/presentation';

export default function CaseAssessmentPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
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

  if (!record) return <div className="container">Case not found.</div>;

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Clinical Assessment & Baseline Evaluation
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Referral diagnostic history, baseline psychometric scores, and clinical eligibility for
            TMS therapy.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/cases/${caseId}/phenotype`} className="btn btn-primary">
            Proceed to Phenotype Workspace →
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Baseline Diagnostic Profile */}
        <div className="card">
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Diagnostic Formulation
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Primary Diagnosis:</span>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '0.125rem' }}>
                {phenotypeVM.primaryDiagnosis}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Treatment Stage:</span>
              <div style={{ color: '#f8fafc', marginTop: '0.125rem' }}>
                Treatment-Resistant Depression (Stage II — ≥ 2 failed antidepressant trials)
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>TMS Safety Qualification:</span>
              <div style={{ color: '#34d399', fontWeight: 600, marginTop: '0.125rem' }}>
                ✓ Cleared (No ferromagnetic implants, no seizure history)
              </div>
            </div>
          </div>
        </div>

        {/* Baseline Psychometric Ratings */}
        <div className="card">
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Baseline Clinical Instruments
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '0.375rem',
              }}
            >
              <span>MADRS Total Score</span>
              <strong style={{ color: '#f59e0b' }}>34 (Severe Depression)</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '0.375rem',
              }}
            >
              <span>GAD-7 Anxiety Score</span>
              <strong style={{ color: '#38bdf8' }}>14 (Moderate-Severe)</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '0.375rem',
              }}
            >
              <span>PHQ-9 Total Score</span>
              <strong style={{ color: '#f59e0b' }}>19 (Moderately Severe)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
