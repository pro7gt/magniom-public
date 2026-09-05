'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function OcdContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [ybocsScore, setYbocsScore] = useState(29);
  const [dimension, setDimension] = useState('Contamination & Washing Compulsions');
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
        <p style={{ color: 'var(--text-secondary)' }}>Case ID {caseId} does not exist.</p>
        <Link href="/cases" className="btn btn-secondary">
          Return to Cases
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    caseStore.approvePhenotype(
      caseId,
      'clin-specialist-001',
      `OCD: Y-BOCS ${ybocsScore}/40, Primary Dimension: ${dimension}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      <nav
        aria-label="OCD Context Breadcrumb"
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
          OCD Symptom Dimensions & Y-BOCS
        </span>
      </nav>

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
            Obsessive-Compulsive Disorder Clinical Formulation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Y-BOCS Severity, CSTC Circuit Endophenotypes & Provocation Protocol (§55, §93)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/provocation-context`} className="btn btn-secondary">
            Provocation Protocol →
          </Link>
          <Link href={`/cases/${caseId}/measurements/efield`} className="btn btn-primary">
            E-field Modeling →
          </Link>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
              margin: '0 0 16px',
              fontSize: '1.05rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            OCD Characterisation
          </h3>
          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Dominant Symptom Dimension
              </label>
              <select
                value={dimension}
                onChange={e => setDimension(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Contamination & Washing Compulsions</option>
                <option>Symmetry, Ordering & Arranging</option>
                <option>Taboo Intrusions & Religious Scrupulosity</option>
                <option>Checking & Doubting / Harm Avoidance</option>
                <option>Hoarding & Saving Behavior</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Yale-Brown Obsessive Compulsive Scale (Y-BOCS): <strong>{ybocsScore} / 40</strong>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={ybocsScore}
                onChange={e => setYbocsScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>0 (Subclinical)</span>
                <span>16 (Moderate)</span>
                <span>28 (Severe)</span>
                <span>40 (Extreme)</span>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Pharmacological Resistance Criteria (Gate G1)
              </strong>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span>✓ Adequate trial of 2+ SSRIs at FDA maximum doses for ≥ 12 weeks</span>
                <span>✓ Failed exposure and response prevention (ERP) behavioral therapy</span>
                <span>✓ Verified Treatment-Resistant OCD</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Save OCD Formulation
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ OCD formulation saved
              </span>
            )}
          </form>
        </section>

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
              margin: '0 0 16px',
              fontSize: '1.05rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            CSTC Circuit Target Candidates (§55, §107)
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Bilateral Supplementary Motor Area (SMA):
              </strong>
              Low-frequency (1 Hz) inhibitory rTMS targeted bilaterally to pre-SMA to downregulate
              hyperactive motor inhibition circuitry.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Dorsal Anterior Cingulate Cortex (dACC):
              </strong>
              High-frequency (20 Hz) deep TMS using custom Hesed H7-coil geometries aimed at
              error-detection overactivity in the conflict-monitoring node.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Left Orbitofrontal Cortex (OFC):
              </strong>
              Inhibitory theta-burst stimulation (cTBS) targeting hyperconnectivity between lateral
              OFC and ventral striatum.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
