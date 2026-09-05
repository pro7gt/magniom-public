'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function BodyRegionPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [selectedRegion, setSelectedRegion] = useState('Right Upper Limb (Hand / Forearm)');
  const [laterality, setLaterality] = useState('Left Hemisphere M1 (Contralateral)');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
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

  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    if (reg.startsWith('Right')) {
      setLaterality('Left Hemisphere M1 (Contralateral)');
    } else if (reg.startsWith('Left')) {
      setLaterality('Right Hemisphere M1 (Contralateral)');
    } else {
      setLaterality('Bilateral dACC / Pre-SMA');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );
    if (hasActiveSlate) {
      caseStore.setStaleness(
        caseId,
        true,
        'Painful body region context modified after slate generation',
        'blocking',
      );
    } else {
      caseStore.notify(caseId);
    }
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      <nav
        aria-label="Body Region Breadcrumb"
        style={{ marginBottom: '16px', fontSize: '0.85rem' }}
      >
        <Link
          href={`/cases/${caseId}`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          {record.clinicalCase.caseCode}
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <Link
          href={`/cases/${caseId}/pain-context`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          Pain Context
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Painful Body Region</span>
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
            Painful Body Region & Somatotopic Mapping
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Penfield Homunculus Somatotopic Projection & Contralateral Cortical Hotspot (§53, §106)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/pain-context`} className="btn btn-secondary">
            ← Pain Context
          </Link>
          <Link href={`/cases/${caseId}/measurements/motor-mapping`} className="btn btn-primary">
            Motor Mapping →
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
            Select Anatomical Distribution
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
                Primary Body Region Affected
              </label>
              <select
                value={selectedRegion}
                onChange={e => handleRegionChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Right Upper Limb (Hand / Forearm)</option>
                <option>Left Upper Limb (Hand / Forearm)</option>
                <option>Right Lower Limb (Leg / Foot)</option>
                <option>Left Lower Limb (Leg / Foot)</option>
                <option>Trigeminal V2/V3 Right Hemiface</option>
                <option>Trigeminal V2/V3 Left Hemiface</option>
                <option>Generalized / Axial Pain</option>
              </select>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                DETERMINED TARGET SOMATOTOPY
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginTop: '4px',
                }}
              >
                {laterality}
              </div>
              <div
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}
              >
                Conforms to Gate G6 contralateral motor mapping rules.
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Confirm Somatotopic Target Spec
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ Somatotopy confirmed
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
            Anatomical Invariants & Hotspot Rules
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
                Hand / Upper Limb:
              </strong>
              Hand Knob region of the precentral gyrus (omega sign in axial slice). Target
              coordinates typically around MNI [±37, -21, 58].
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Foot / Lower Limb:
              </strong>
              Medial motor strip along the interhemispheric fissure (paracentral lobule). Angled
              double-cone or deep coil required.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Trigeminal / Face:
              </strong>
              Lateral and inferior primary motor cortex adjacent to the sylvian fissure. Facial
              nerve twitch monitoring required.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
