import { SYNTHETIC_POLICY_V1 } from '@magniom/scientific-policy';
import { GOLDEN_CASE_01_PHENOTYPE, GOLDEN_CASE_01_PRIMARY_CANDIDATE } from '@magniom/test-fixtures';
import { toCandidateViewModel } from '@magniom/presentation';

export default function HomePage() {
  const candidateVM = toCandidateViewModel(GOLDEN_CASE_01_PRIMARY_CANDIDATE);

  return (
    <div className="container">
      <div className="warning-banner">
        <strong style={{ color: '#ef4444' }}>CLINICAL DECISION SUPPORT NOTICE (IEC 62304 / ISO 14971):</strong>
        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#f3f4f6' }}>
          Magniom generates candidate target slates for specialist clinician review. It does not prescribe treatment. Final targeting authority rests solely with the treating clinician.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Sprint 0 — Controlled Development Foundation
        </h1>
        <p style={{ color: '#9ca3af' }}>
          System foundation initialized with strict typing, domain separation, requirement traceability, and design controls.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#38bdf8' }}>
            System Architecture Status
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#9ca3af' }}>Product Maturity:</span>
              <span style={{ fontWeight: 600 }}>M0 (Design) → M1 Ready</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#9ca3af' }}>Active Policy Release:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{SYNTHETIC_POLICY_V1.version}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#9ca3af' }}>Target Engine Core:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Pure Deterministic (Offline)</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#9ca3af' }}>Local Database:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Supabase PostgreSQL 15+</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#818cf8' }}>
            Synthetic Golden Case G01 Preview
          </h2>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Synthetic Diagnosis:</span>
              <p style={{ fontWeight: 500, marginTop: '0.25rem' }}>{GOLDEN_CASE_01_PHENOTYPE.primaryDiagnosis}</p>
            </div>
            <div style={{ background: '#1f2937', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>{candidateVM.roleLabel}</span>
                <span className="badge badge-tier1">{candidateVM.evidenceTierLabel}</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                Coordinate: <strong style={{ color: '#f3f4f6', fontFamily: 'var(--font-mono)' }}>{candidateVM.coordinateFormatted}</strong>
              </p>
              <p style={{ color: '#d1d5db', fontSize: '0.8125rem' }}>{candidateVM.rationale}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
