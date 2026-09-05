'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function SubstanceContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [substance, setSubstance] = useState('Alcohol Use Disorder (AUD)');
  const [dsmSeverity, setDsmSeverity] = useState('Severe (6+ DSM-5 Criteria)');
  const [cravingScore, setCravingScore] = useState(7.5);
  const [abstinenceWeeks, setAbstinenceWeeks] = useState(4);
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
      `Substance Use Disorder: Craving ${cravingScore}/10, Substance: ${substance}, Severity: ${dsmSeverity}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      <nav
        aria-label="SUD Context Breadcrumb"
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
          Substance Use Disorder Context
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
            Substance Use Disorder (SUD) Clinical Formulation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            DSM-5 Severity, Craving Dynamics & Cortico-Striato-Insular Circuit Modulation (§55, §93)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/cue-context`} className="btn btn-secondary">
            Cue Exposure Protocol →
          </Link>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-primary">
            Target Slate →
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
            Substance Taxonomy & Severity
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
                Primary Substance of Dependence
              </label>
              <select
                value={substance}
                onChange={e => setSubstance(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Alcohol Use Disorder (AUD)</option>
                <option>Tobacco / Nicotine Dependence</option>
                <option>Cocaine / Psychostimulant Use Disorder</option>
                <option>Opioid Use Disorder (Stabilized on MAT)</option>
                <option>Cannabis Use Disorder</option>
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
                DSM-5 Diagnostic Severity
              </label>
              <select
                value={dsmSeverity}
                onChange={e => setDsmSeverity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Severe (6+ DSM-5 Criteria)</option>
                <option>Moderate (4–5 Criteria)</option>
                <option>Mild (2–3 Criteria)</option>
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
                Baseline Craving Intensity (VAS): <strong>{cravingScore} / 10</strong>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={cravingScore}
                onChange={e => setCravingScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
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
                Verified Abstinence Duration: <strong>{abstinenceWeeks} weeks</strong>
              </label>
              <input
                type="number"
                min="1"
                max="104"
                value={abstinenceWeeks}
                onChange={e => setAbstinenceWeeks(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Confirm Addiction Formulation
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ Formulation saved
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
            Frontostriatal Addiction Targets
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
                Left DLPFC (Executive Control):
              </strong>
              High-frequency (10–20 Hz) stimulation to enhance top-down prefrontal inhibitory
              control over striatal craving urges.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Bilateral Insular Cortex / Deep TMS:
              </strong>
              Deep H-coil or angled figure-8 targeting anterior insula to dampen visceral
              interoceptive craving representations.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
