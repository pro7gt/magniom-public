'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function LesionContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [hasLesion, setHasLesion] = useState(true);
  const [lesionType, setLesionType] = useState('Ischemic Infarct (Left MCA Superior Division)');
  const [skullAbnormality, setSkullAbnormality] = useState(false);
  const [clearanceMm, setClearanceMm] = useState(18.5);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const r = caseStore.getCaseRecord(caseId);
    setRecord(r);
    if (r?.lesionContext) {
      setHasLesion(r.lesionContext.hasLesion);
      if (r.lesionContext.lesionType) setLesionType(r.lesionContext.lesionType);
      setSkullAbnormality(r.lesionContext.skullAbnormalityPresent);
    }
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        const updated = caseStore.getCaseRecord(caseId);
        setRecord(updated);
        if (updated?.lesionContext) {
          setHasLesion(updated.lesionContext.hasLesion);
          if (updated.lesionContext.lesionType) setLesionType(updated.lesionContext.lesionType);
          setSkullAbnormality(updated.lesionContext.skullAbnormalityPresent);
        }
      }
    });
    return () => unsubscribe();
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

  const isGateG3Passed = !skullAbnormality && clearanceMm >= 15.0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    caseStore.updateLesionContext(caseId, {
      hasLesion,
      lesionType,
      laterality: 'Left Hemisphere',
      interpretation: 'Stable mature cavitation with gliotic margin. No mass effect.',
      affectedRegionsCount: 3,
      hasTargetOverlapWarning: clearanceMm < 15.0,
      skullAbnormalityPresent: skullAbnormality,
    });
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      <nav
        aria-label="Lesion Context Breadcrumb"
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
          Structural Lesion Context
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
            Structural Lesion Context & Boundary Exclusions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Hard Gate G3 Structural Exclusions & Skull Breach Safety Invariants (§54, §93)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/measurements/lesion-mask`} className="btn btn-secondary">
            Lesion Mask Details →
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
            Lesion Segmentation & Safety Parameters
          </h3>
          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="has-lesion"
                checked={hasLesion}
                onChange={e => setHasLesion(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <label
                htmlFor="has-lesion"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                Structural Parenchymal Lesion Present
              </label>
            </div>

            {hasLesion && (
              <>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Lesion Etiology & Territory
                  </label>
                  <select
                    value={lesionType}
                    onChange={e => setLesionType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option>Ischemic Infarct (Left MCA Superior Division)</option>
                    <option>Ischemic Infarct (Right MCA Deep Territory)</option>
                    <option>Intracerebral Hemorrhage (Basal Ganglia Resorbed)</option>
                    <option>Traumatic Cortical Contusion (Frontal Pole)</option>
                    <option>Arteriovenous Malformation Treated (Stable)</option>
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
                    Target-to-Lesion Clearance Distance: <strong>{clearanceMm} mm</strong>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="0.5"
                    value={clearanceMm}
                    onChange={e => setClearanceMm(Number(e.target.value))}
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
                    <span>5 mm (DANGER)</span>
                    <span>15 mm (Minimum Threshold)</span>
                    <span>40 mm (Generous)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="skull-defect"
                    checked={skullAbnormality}
                    onChange={e => setSkullAbnormality(e.target.checked)}
                    style={{ accentColor: 'var(--accent-red)' }}
                  />
                  <label
                    htmlFor="skull-defect"
                    style={{
                      fontSize: '0.85rem',
                      color: skullAbnormality ? 'var(--accent-red)' : 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    Skull breach, decompressive hemicraniectomy, or burr hole present
                  </label>
                </div>
              </>
            )}

            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: isGateG3Passed
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${isGateG3Passed ? 'var(--accent-green)' : 'var(--accent-red)'}`,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: isGateG3Passed ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontSize: '0.85rem',
                }}
              >
                {isGateG3Passed
                  ? '✓ Gate G3 Passed: Structural Safety Cleared'
                  : '✗ Gate G3 Block: Safety Violation'}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isGateG3Passed
                  ? `Clearance of ${clearanceMm} mm exceeds 15.0 mm safety margin with intact cranium.`
                  : skullAbnormality
                    ? 'CRANIAL BREACH DETECTED: TMS across a cranial defect induces severe current distortion and is strictly contraindicated.'
                    : 'INSUFFICIENT CLEARANCE: Candidate stimulation cone encroaches directly on encephalomalacic cavity.'}
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Confirm Lesion Boundaries
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ Lesion context updated
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
            Lesion Exclusion Rules (ISO 14971)
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
                Zero Direct Cavity Stimulation:
              </strong>
              Necrotic core tissue contains no viable neurons; direct stimulation wastes coil energy
              and can cause erratic current channeling.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Perilesional Penumbra Target:
              </strong>
              Stimulation is prioritized to the intact functionally connected margin immediately
              surrounding the lesion boundary.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Skull Defect Shunting:
              </strong>
              Bone defects alter regional impedance by up to 10×, concentrating electric fields to
              seizure-inducing intensities.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
