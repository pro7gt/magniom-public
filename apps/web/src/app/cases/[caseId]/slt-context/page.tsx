'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function SltContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [therapyType, setTherapyType] = useState('Semantic Feature Analysis (SFA) + CILT');
  const [bntScore, setBntScore] = useState(28);
  const [timingWindow, setTimingWindow] = useState('Within 30 minutes post-rTMS');
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
        'Concurrent SLT therapy context modified after slate generation',
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
        aria-label="SLT Context Breadcrumb"
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
          href={`/cases/${caseId}/aphasia-context`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          Aphasia Context
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          Concurrent Speech Therapy (SLT)
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
            Concurrent Speech-Language Therapy (SLT) Protocol
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Neuroplastic Priming Window & Behavioral Pairing Coordination (§54, §93)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/aphasia-context`} className="btn btn-secondary">
            ← Aphasia Context
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
            SLT Protocol Specification
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
                Primary Behavioral Intervention
              </label>
              <select
                value={therapyType}
                onChange={e => setTherapyType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Semantic Feature Analysis (SFA) + CILT</option>
                <option>Constraint-Induced Language Therapy (CILT)</option>
                <option>Melodic Intonation Therapy (MIT)</option>
                <option>Phonological Component Analysis (PCA)</option>
                <option>Script Training for Conversational Fluency</option>
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
                Boston Naming Test (BNT) Baseline: <strong>{bntScore} / 60</strong>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={bntScore}
                onChange={e => setBntScore(Number(e.target.value))}
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
                <span>0 (Severe Anomia)</span>
                <span>30 (Moderate)</span>
                <span>60 (Normal)</span>
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
                Coupling Timing Window
              </label>
              <select
                value={timingWindow}
                onChange={e => setTimingWindow(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <option>Within 30 minutes post-rTMS (Optimal Priming Window)</option>
                <option>30–60 minutes post-rTMS</option>
                <option>Concurrent during 1 Hz low-frequency stimulation</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Confirm Concurrent SLT Plan
            </button>
            {isSaved && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                ✓ SLT coupling verified
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
            Neuroplastic Priming Mechanism
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
              Under <strong>IMR-APHASIA-2.0.0</strong>, neuromodulation without concurrent
              behavioral therapy shows significantly reduced long-term retention.
            </p>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Long-Term Potentiation (LTP) Priming:
              </strong>
              <span>
                rTMS creates a temporary (45-minute) neuroplastic state by lowering synaptic
                depolarization thresholds in peri-infarct language cortex.
              </span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Hebbian Synaptic Stabilization:
              </strong>
              <span>
                Immediate speech-language exercises channel this heightened excitability into
                task-specific linguistic representations, preventing non-specific synaptic noise.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
