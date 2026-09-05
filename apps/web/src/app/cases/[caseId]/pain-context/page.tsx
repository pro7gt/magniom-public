'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function PainContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [vasScore, setVasScore] = useState(8);
  const [painType, setPainType] = useState('Central Post-Stroke Pain (CPSP)');
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
      `Intractable Neuropathic Pain: VAS ${vasScore}/10, Type: ${painType}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      {/* Breadcrumbs */}
      <nav
        aria-label="Pain Context Breadcrumb"
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
          Pain Phenotype & Somatotopy
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
              Pain Phenotype & Somatotopy
            </h1>
            <span className="badge badge-tier1">IMR-PAIN-2.0.0</span>
            <span className="badge badge-tier2">Validation Mode</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Intractable Neuropathic Pain Formulation (§53, §93) · Contralateral Motor Cortex
            Somatotopy Target Rules
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/body-region`} className="btn btn-secondary">
            Body Region Mapping →
          </Link>
          <Link href={`/cases/${caseId}/measurements/motor-mapping`} className="btn btn-primary">
            TMS Motor Mapping →
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Form Card */}
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
            Pain Characterisation & Severity
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
                Primary Neuropathic Pain Etiology
              </label>
              <select
                value={painType}
                onChange={e => setPainType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Central Post-Stroke Pain (CPSP)</option>
                <option>Trigeminal Neuropathic Pain</option>
                <option>Phantom Limb Pain</option>
                <option>Refractory Radiculopathy</option>
                <option>Spinal Cord Injury Neuropathic Pain</option>
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
                Visual Analog Scale (VAS) Baseline: <strong>{vasScore} / 10</strong>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={vasScore}
                onChange={e => setVasScore(Number(e.target.value))}
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
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe / Disabling)</span>
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
                Refractory Pharmacotherapy Verification
              </label>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span>
                  ✓ Gabapentinoids (Pregabalin / Gabapentin) failed at therapeutic ceiling
                </span>
                <span>✓ SNRIs (Duloxetine) or TCAs (Amitriptyline) failed or not tolerated</span>
                <span>✓ Verified Intractable Neuropathic Pain under Gate G1</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '8px' }}
            >
              Save Phenotype Parameters
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ Phenotype snapshot updated
              </span>
            )}
          </form>
        </section>

        {/* Clinical Guidance Card */}
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
            Targeting Invariants & Somatotopy (§53, §106)
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
              Under the <strong>PAIN Module Release</strong>, high-frequency rTMS (10–20 Hz) is
              targeted to the <strong>primary motor cortex (M1)</strong> somatotopically
              corresponding to the painful body territory, or the{' '}
              <strong>dorsal anterior cingulate cortex (dACC)</strong> for affective pain burden.
            </p>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Hard Gate G6: Laterality Preservation
              </strong>
              <span>
                Stimulation must be delivered <strong>contralateral</strong> to the painful limb or
                hemibody. Any laterality inversion is blocked automatically as an unsafe candidate.
              </span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Required Modalities
              </strong>
              <span>
                TMS Motor Mapping + Motor Evoked Potentials (MEP) are mandatory to qualify the M1
                cortical representation prior to Target Slate assembly.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
