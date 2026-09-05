'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function DiseaseStagePage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [stageCode, setStageCode] = useState(() => record?.diseaseStage?.stageCode || 'CHRONIC');
  const [daysSinceEvent, setDaysSinceEvent] = useState(240);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const r = caseStore.getCaseRecord(caseId);
    setRecord(r);
    if (r?.diseaseStage?.stageCode) {
      setStageCode(r.diseaseStage.stageCode);
    }
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        const updated = caseStore.getCaseRecord(caseId);
        setRecord(updated);
        if (updated?.diseaseStage?.stageCode) {
          setStageCode(updated.diseaseStage.stageCode);
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

  const isEligible = stageCode === 'CHRONIC' || stageCode === 'SUBACUTE';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    caseStore.updateDiseaseStage(caseId, {
      stageCode,
      stageLabel:
        stageCode === 'CHRONIC'
          ? 'Chronic (>6 months)'
          : stageCode === 'SUBACUTE'
            ? 'Subacute (2 weeks–6 months)'
            : 'Acute (<2 weeks)',
      determinationMethod: 'Clinical records & neuroimaging confirmation',
      isSubacuteOrAcute: stageCode !== 'CHRONIC',
    });
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      <nav
        aria-label="Disease Stage Breadcrumb"
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
          Disease Chronicity & Stage
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
            Disease Chronicity & Stage Qualification
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Hard Gate G2 Temporal Qualification & Stage Eligibility (§54, §93)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/lesion`} className="btn btn-secondary">
            Lesion Mapping →
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
            Configure Disease Stage
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
                Chronicity Classification
              </label>
              <select
                value={stageCode}
                onChange={e => setStageCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="CHRONIC">Chronic Post-Stroke (&gt; 6 Months Post-Onset)</option>
                <option value="SUBACUTE">Subacute Phase (14 Days – 6 Months Post-Onset)</option>
                <option value="ACUTE">Acute Phase (&lt; 14 Days Post-Onset) — PROHIBITED</option>
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
                Days Since Index Vascular Event: <strong>{daysSinceEvent} days</strong>
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={daysSinceEvent}
                onChange={e => setDaysSinceEvent(Number(e.target.value))}
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

            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: isEligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${isEligible ? 'var(--accent-green)' : 'var(--accent-red)'}`,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: isEligible ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontSize: '0.85rem',
                }}
              >
                {isEligible
                  ? '✓ Gate G2 Passed: Protocol Eligible'
                  : '✗ Gate G2 Rejection: Acute Stage Prohibited'}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isEligible
                  ? 'Chronic or subacute post-stroke status qualifies for outpatient rTMS neuromodulation protocol.'
                  : 'Acute post-stroke TMS (&lt;14 days) is strictly prohibited due to seizure risk and penumbral hemodynamic instability.'}
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Save Stage Certification
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ Disease stage updated
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
            Scientific Rationale & Stage Policy
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
                Chronic (&gt; 6 months):
              </strong>
              Spontaneous recovery plateau reached. Interhemispheric transcallosal inhibition is
              established and maladaptive; targeted rTMS promotes late-stage cortical
              reorganization.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Subacute (2 wks – 6 mos):
              </strong>
              Heightened neuroplastic window. Facilitatory stimulation to ipsilesional motor
              networks must be paired with daily physical/occupational therapy within 60 minutes.
            </li>
            <li
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Acute (&lt; 2 weeks):
              </strong>
              Precluded by ISO 14971 Risk Control RC-STR-002 to avoid disruption of ischemic
              penumbra revascularization.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
