'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function StrokeImpairmentPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [fmaScore, setFmaScore] = useState(24);
  const [pareticSide, setPareticSide] = useState('Right Hemiparesis (Left Hemisphere Infarct)');
  const [ashworthScale, setAshworthScale] = useState(
    '1+ (Slight increase in tone, catch and release)',
  );
  const [hasFingerExtension, setHasFingerExtension] = useState(true);
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
      `Stroke Motor: FMA-UE ${fmaScore}/66, Side: ${pareticSide}, Ashworth: ${ashworthScale}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      <nav
        aria-label="Stroke Impairment Breadcrumb"
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
          Stroke Motor Impairment
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
            Post-Stroke Motor Deficit & Baseline Metrics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Fugl-Meyer Assessment, Spasticity & Residual Corticospinal Tract Potential (§54, §93)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/stage`} className="btn btn-secondary">
            Stroke Chronicity Stage →
          </Link>
          <Link href={`/cases/${caseId}/lesion`} className="btn btn-primary">
            Lesion Mapping →
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
            Motor Deficit Assessment
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
                Paretic Upper Limb Laterality
              </label>
              <select
                value={pareticSide}
                onChange={e => setPareticSide(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Right Hemiparesis (Left Hemisphere Infarct)</option>
                <option>Left Hemiparesis (Right Hemisphere Infarct)</option>
                <option>Bilateral / Brainstem Infarct Quadriparesis</option>
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
                Fugl-Meyer Assessment Upper Extremity (FMA-UE): <strong>{fmaScore} / 66</strong>
              </label>
              <input
                type="range"
                min="0"
                max="66"
                value={fmaScore}
                onChange={e => setFmaScore(Number(e.target.value))}
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
                <span>0 (Severe Plega)</span>
                <span>33 (Moderate)</span>
                <span>66 (Normal Function)</span>
              </div>
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
                Modified Ashworth Scale (MAS) Spasticity
              </label>
              <select
                value={ashworthScale}
                onChange={e => setAshworthScale(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>0 (No increase in tone)</option>
                <option>1 (Slight increase in tone, minimal catch)</option>
                <option>1+ (Slight increase in tone, catch and release)</option>
                <option>2 (More marked increase, affected part easily flexed)</option>
                <option>3 (Considerable increase in tone, passive movement difficult)</option>
                <option>4 (Rigid in flexion or extension)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="finger-ext"
                checked={hasFingerExtension}
                onChange={e => setHasFingerExtension(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <label
                htmlFor="finger-ext"
                style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                Residual voluntary active finger extension present (&gt; 10° at MCP/IP joints)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Confirm Impairment Profile
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ Impairment profile confirmed
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
            Corticospinal Tract & Neuroplastic Invariants
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ margin: 0 }}>
              Under <strong>IMR-STROKE-2.0.0</strong>, neuromodulation targeting stratifies based on
              the presence of residual motor potential:
            </p>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Ipsilesional Facilitation (FMA &gt; 20):
              </strong>
              <span>
                High-frequency rTMS (10–20 Hz) or iTBS applied to the ipsilesional motor cortex (M1
                / premotor) to upregulate perilesional excitability.
              </span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Contralesional Inhibition (FMA ≤ 20):
              </strong>
              <span>
                Low-frequency rTMS (1 Hz) or cTBS to the contralesional M1 to suppress maladaptive
                interhemispheric inhibition.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
