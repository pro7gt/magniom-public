'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import type { CaseShellViewModel } from '@magniom/presentation';

export default function ClinicalObjectivePage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [burdenInput, setBurdenInput] = useState('');
  const [priorityInput, setPriorityInput] = useState(1);

  useEffect(() => {
    const r = caseStore.getCaseRecord(caseId);
    setRecord(r);
    if (r?.clinicalObjective) {
      setTitleInput(r.clinicalObjective.title);
      setBurdenInput(r.clinicalObjective.burdenScoreText || '');
      setPriorityInput(r.clinicalObjective.priorityRank || 1);
    }
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        const updated = caseStore.getCaseRecord(caseId);
        setRecord(updated);
        if (updated?.clinicalObjective) {
          setTitleInput(updated.clinicalObjective.title);
          setBurdenInput(updated.clinicalObjective.burdenScoreText || '');
          setPriorityInput(updated.clinicalObjective.priorityRank || 1);
        }
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
        <Link
          href="/cases"
          className="btn btn-primary"
          style={{ marginTop: '1rem', display: 'inline-block' }}
        >
          Return to Cases
        </Link>
      </div>
    );
  }

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const indication = shellVm?.indication;
  const moduleAuthority = shellVm?.moduleAuthority;
  const effectiveObjective = record.clinicalObjective;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    caseStore.updateClinicalObjective(caseId, {
      id: record.clinicalObjective?.id || `obj-${caseId}-${Date.now()}`,
      title: titleInput.trim(),
      priorityRank: priorityInput,
      burdenScoreText: burdenInput.trim() || undefined,
      isEvidenceMappable: record.clinicalObjective?.isEvidenceMappable ?? true,
    });

    setIsEditing(false);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
  };

  return (
    <div
      className="clinical-objective-workspace"
      style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}
    >
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
        <Link
          href={`/cases/${caseId}`}
          style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
        >
          Case Overview
        </Link>{' '}
        /{' '}
        <Link
          href={`/cases/${caseId}/context`}
          style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
        >
          Clinical Context
        </Link>{' '}
        / <span style={{ color: 'var(--text-secondary)' }}>Clinical Objective</span>
      </nav>

      {/* Header (§72, §95) */}
      <header
        style={{
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2
              style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 700 }}
            >
              Clinical Objective Formulation
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Defines the clinical target intention governing Target Slate calculation and ranking
              for{' '}
              <strong>
                {indication?.indicationFormatted || record.clinicalCase.indicationCode}
              </strong>
              .
            </p>
          </div>
          {moduleAuthority && (
            <span
              className={`badge ${moduleAuthority.isClinicalAuthorised ? 'badge-tier1' : moduleAuthority.isResearchOnly ? 'badge-tierexp' : 'badge-tier2'}`}
              title={`Module: ${moduleAuthority.humanReadableName} (${moduleAuthority.moduleVersion})`}
            >
              {moduleAuthority.permissionLabel}
            </span>
          )}
        </div>

        {/* Normative Principle Alert (§95) */}
        <div
          role="note"
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--text-main)' }}>§95 Clinical Objective First:</strong> Each
          target workspace SHALL keep visible what the candidate is intended to address. A target
          should never become a decontextualised coordinate.
        </div>
      </header>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Active Clinical Objective Card */}
        <section
          className="context-card"
          aria-labelledby="active-objective-heading"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h3
              id="active-objective-heading"
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
              }}
            >
              Active Objective Specification
            </h3>
            {!isEditing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (effectiveObjective) {
                    setTitleInput(effectiveObjective.title);
                    setBurdenInput(effectiveObjective.burdenScoreText || '');
                    setPriorityInput(effectiveObjective.priorityRank || 1);
                  }
                  setIsEditing(true);
                }}
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                {effectiveObjective ? 'Edit Objective' : 'Formulate Objective'}
              </button>
            )}
          </div>

          {isEditing ? (
            <form
              onSubmit={handleSave}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  htmlFor="obj-title"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Objective Title / Intention *
                </label>
                <input
                  id="obj-title"
                  type="text"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="e.g., Left DLPFC-SGC Circuit Modulation for MDD Remission"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                  }}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="obj-priority"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Priority Rank
                </label>
                <select
                  id="obj-priority"
                  value={priorityInput}
                  onChange={e => setPriorityInput(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value={1}>1 (Primary Clinical Target)</option>
                  <option value={2}>2 (Secondary Adjunctive)</option>
                  <option value={3}>3 (Exploratory / Alternative)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="obj-burden"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Symptom / Burden Metric
                </label>
                <input
                  id="obj-burden"
                  type="text"
                  value={burdenInput}
                  onChange={e => setBurdenInput(e.target.value)}
                  placeholder="e.g., MADRS: 34 (Severe depression), HAM-D: 26"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                >
                  Save Objective
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : effectiveObjective ? (
            <div>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                {effectiveObjective.title}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                  Priority Rank: #{effectiveObjective.priorityRank}
                </span>
                <span
                  className={`badge ${effectiveObjective.isEvidenceMappable ? 'badge-tier1' : 'badge-neutral'}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  {effectiveObjective.isEvidenceMappable
                    ? 'Evidence Mappable'
                    : 'Not Directly Mapped'}
                </span>
              </div>
              {effectiveObjective.burdenScoreText && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Symptom Burden Baseline
                  </span>
                  <p
                    style={{
                      margin: '4px 0 0',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {effectiveObjective.burdenScoreText}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
                No clinical objective has been formulated for this case. Clinical formulation must
                precede algorithmic Target Slate generation.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                style={{ fontSize: '0.85rem' }}
              >
                Formulate Clinical Objective Now
              </button>
            </div>
          )}
        </section>

        {/* Context Relationships & Invariants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h4
              style={{
                margin: '0 0 10px',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                fontWeight: 600,
              }}
            >
              Governing Clinical Invariants
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <strong>Clinical Formulation Precedence (§7):</strong> Algorithmic candidate
                generation cannot proceed until clinical objective is established.
              </li>
              <li>
                <strong>No Cross-Indication Reuse (§67):</strong> Objective modifications for{' '}
                {record.clinicalCase.indicationCode} do not alter other registered indications.
              </li>
              <li>
                <strong>Staleness Invalidation (§78):</strong> Modifying the clinical objective
                invalidates any existing Target Slate to prevent mismatched targeting.
              </li>
            </ul>
          </section>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href={`/cases/${caseId}/context`}
              className="btn btn-secondary"
              style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '10px' }}
            >
              View Full Clinical Context
            </Link>
            <Link
              href={`/cases/${caseId}/targets`}
              className="btn btn-primary"
              style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '10px' }}
            >
              Inspect Target Slate →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
