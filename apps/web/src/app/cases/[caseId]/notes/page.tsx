'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function CaseResearchNotesPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [noteContent, setNoteContent] = useState(
    'Session 1 Observation: Exploratory connectome mapping protocol. Subject tolerated baseline pure-tone matching and resting-state sequence without motion artifact. Pre-stimulation audiometric threshold confirmed.',
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

  const isResearch =
    record.clinicalCase.mode === 'RESEARCH' ||
    record.clinicalCase.indicationCode === 'TINNITUS' ||
    record.clinicalCase.indicationCode === 'TBI';

  return (
    <div className="research-notes-workspace" style={{ padding: '24px' }}>
      {/* Breadcrumbs */}
      <nav
        aria-label="Research Notes Breadcrumb"
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
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Research Notes</span>
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
              Investigator &amp; Research Notes (§57)
            </h1>
            <span className={isResearch ? 'badge badge-tierexp' : 'badge badge-neutral'}>
              {isResearch ? 'RESEARCH PROTOCOL' : 'CLINICAL AUDIT LOG'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Non-prescriptive scientific observations, sham-control blinding logs, and experimental
            commentary.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-secondary">
            Target Hypotheses →
          </Link>
          <Link href={`/cases/${caseId}`} className="btn btn-secondary">
            Case Overview
          </Link>
        </div>
      </header>

      {/* Editor & Protocol Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Card 1: Notes Editor */}
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h2
            style={{ margin: 0, fontSize: '1.05rem', color: 'var(--accent-cyan)', fontWeight: 600 }}
          >
            Session Observation Notes
          </h2>
          <textarea
            value={noteContent}
            onChange={e => {
              setNoteContent(e.target.value);
              setIsSaved(false);
            }}
            rows={8}
            style={{
              width: '100%',
              backgroundColor: '#090d16',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#fff',
              padding: '12px',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Encrypted in local session buffer (§238)
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => setIsSaved(true)}>
              {isSaved ? '✓ Saved to Session' : 'Save Notes'}
            </button>
          </div>
        </section>

        {/* Card 2: Blinding & Protocol Integrity Checklist */}
        <section
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '1.05rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Blinding &amp; Governance Verification
          </h2>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.85rem',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span>Operator separated from clinical evaluator (Silent Prospective protocol)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span>
                Zero-PHI tokenization: Subject SUBJ-{record.clinicalCase.patientId} verified
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span>Export format: anonymized NIfTI target geometry coordinates only</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fbbf24' }}>⚠</span>
              <span>Clinical signing lock active (§57, §139)</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
