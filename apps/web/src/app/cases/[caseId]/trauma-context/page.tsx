'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function TraumaContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [traumaType, setTraumaType] = useState<'civilian' | 'combat' | 'first_responder'>(
    'civilian',
  );
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
        <p style={{ color: 'var(--text-secondary)' }}>
          Case ID {caseId} does not exist in the active case store.
        </p>
        <Link href="/cases" className="btn btn-secondary">
          Return to Cases
        </Link>
      </div>
    );
  }

  const isCombat = traumaType === 'combat';

  return (
    <div className="trauma-context-workspace" style={{ padding: '24px' }}>
      {/* Breadcrumbs */}
      <nav
        aria-label="Trauma Screening Breadcrumb"
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
          Trauma Screening &amp; Population Context
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
              Trauma Etiology &amp; Population Screening (§71)
            </h1>
            <span className="badge badge-tier1">EVIDENCE BOUND</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Identifies trauma category to enforce evidence applicability boundaries without masking
            anatomical fit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/ptsd-context`} className="btn btn-secondary">
            ← PTSD Battery
          </Link>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-primary">
            Target Slate →
          </Link>
        </div>
      </header>

      {/* Conflict Warning Banner (§71) */}
      {isCombat && (
        <div
          role="alert"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <strong style={{ color: 'var(--accent-red)', fontSize: '0.95rem' }}>
              Population Applicability Conflict Warning (PTSD_POPULATION_CONFLICT)
            </strong>
            <p
              style={{ margin: '4px 0 0', color: '#fca5a5', fontSize: '0.85rem', lineHeight: 1.5 }}
            >
              Published randomized trial evidence demonstrates substantial differences in sham
              response rates and pooled effect sizes between civilian and combat-exposed veteran
              populations (SMD -0.16, 95% CI -0.42 to 0.10, p = 0.23). Clinical benefit may be
              attenuated. The Target Engine will preserve this caveat explicitly on generated
              candidates (§71).
            </p>
          </div>
        </div>
      )}

      {/* Form / Selection Card */}
      <section
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '720px',
        }}
      >
        <h2
          style={{
            margin: '0 0 16px',
            fontSize: '1.1rem',
            color: 'var(--text-main)',
            fontWeight: 600,
          }}
        >
          Index Trauma Classification
        </h2>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor:
                traumaType === 'civilian'
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${traumaType === 'civilian' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="traumaType"
              value="civilian"
              checked={traumaType === 'civilian'}
              onChange={() => setTraumaType('civilian')}
            />
            <div>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                Civilian Non-Combat Trauma
              </strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Accidental, physical assault, interpersonal, or natural disaster trauma. Level B RCT
                evidence applies.
              </div>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor:
                traumaType === 'combat' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${traumaType === 'combat' ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.08)'}`,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="traumaType"
              value="combat"
              checked={traumaType === 'combat'}
              onChange={() => setTraumaType('combat')}
            />
            <div>
              <strong style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
                Combat-Related / Military Veteran Trauma
              </strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Operational combat exposure. Triggers evidence applicability conflict disclosure
                (§71).
              </div>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor:
                traumaType === 'first_responder'
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${traumaType === 'first_responder' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="traumaType"
              value="first_responder"
              checked={traumaType === 'first_responder'}
              onChange={() => setTraumaType('first_responder')}
            />
            <div>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                First Responder / Cumulative Occupational Trauma
              </strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Paramedic, police, fire, or emergency clinical service trauma history.
              </div>
            </div>
          </label>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            const hasActiveSlate = Boolean(
              (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
              record.clinicalCase.currentTargetSlateId,
            );
            if (hasActiveSlate) {
              caseStore.setStaleness(
                caseId,
                true,
                'Trauma screening context updated after slate generation',
                'blocking',
              );
            } else {
              caseStore.notify(caseId);
            }
            setRecord({ ...caseStore.getCaseRecord(caseId)! });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
          }}
          style={{ width: '100%' }}
        >
          {isSaved
            ? '✓ Trauma Screening Confirmed & Synced'
            : 'Confirm Trauma Screening & Bind to Case'}
        </button>
      </section>
    </div>
  );
}
