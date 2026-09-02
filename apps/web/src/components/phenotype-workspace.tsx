'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhenotypeViewModel, PhenotypeDomainRowViewModel } from '@magniom/presentation';

interface PhenotypeWorkspaceProps {
  initialViewModel: PhenotypeViewModel;
  onApprove: (clinicianNotes: string) => void;
}

export function PhenotypeWorkspace({ initialViewModel, onApprove }: PhenotypeWorkspaceProps) {
  const router = useRouter();
  const [domains, setDomains] = useState<PhenotypeDomainRowViewModel[]>([
    ...initialViewModel.domains,
  ]);
  const [explainerDomain, setExplainerDomain] = useState<PhenotypeDomainRowViewModel | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [clinicianNotes, setClinicianNotes] = useState(initialViewModel.clinicianNotes || '');
  const [isApproving, setIsApproving] = useState(false);

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= domains.length) return;

    const newDomains = [...domains];
    const src = newDomains[index];
    const dst = newDomains[targetIndex];
    if (!src || !dst) return;

    newDomains[index] = dst;
    newDomains[targetIndex] = src;

    // Re-index priority numbers
    const updated = newDomains.map((d, i) => ({ ...d, clinicalPriority: i + 1 }));
    setDomains(updated);
  };

  const handleImportanceChange = (index: number, importance: 'High' | 'Moderate' | 'Low') => {
    const item = domains[index];
    if (!item) return;
    const newDomains = [...domains];
    newDomains[index] = { ...item, clinicalImportance: importance };
    setDomains(newDomains);
  };

  const handleExecuteApproval = () => {
    setIsApproving(true);
    try {
      onApprove(clinicianNotes);
      setShowApprovalDialog(false);
      router.push(`/cases/${initialViewModel.caseId}/targets`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            Clinical Phenotype Workspace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Formulate and confirm patient symptom burden, treatment priorities, and circuit
            mappability before target synthesis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {initialViewModel.isApproved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-tier1">PHENOTYPE SEALED & APPROVED</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                {initialViewModel.snapshotHash?.slice(0, 16)}...
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowApprovalDialog(true)}
              className="btn btn-primary"
              id="approve-phenotype-btn"
            >
              Approve Phenotype for Target Analysis →
            </button>
          )}
        </div>
      </div>

      {/* Safety Callout: Clinical Importance != Targetability */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ color: 'var(--accent-cyan)', fontSize: '1.25rem' }}>ℹ</span>
        <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
          <strong>Fundamental Principle (MAG-SAFE-001):</strong> Clinically important does not
          necessarily mean independently targetable. Domains with direct circuit mapping inform
          specific candidate hypotheses; non-mappable domains inform overall prognosis and priority
          weighting.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        {/* Left: Symptom Domain Severity & Circuit Mappings */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Symptom Domain Formulation</h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Mappable to Circuits:{' '}
              <strong>
                {initialViewModel.targetMappableCount} / {initialViewModel.totalDomainCount}
              </strong>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {domains.map((domain, index) => {
              const isDirect = domain.circuitMappingStatus === 'Direct';
              const isPartial = domain.circuitMappingStatus === 'Partial';

              return (
                <div
                  key={domain.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        {domain.domainName}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background:
                            domain.severityLabel === 'Severe' || domain.severityLabel === 'Extreme'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(56, 189, 248, 0.15)',
                          color:
                            domain.severityLabel === 'Severe' || domain.severityLabel === 'Extreme'
                              ? '#f87171'
                              : '#38bdf8',
                        }}
                      >
                        {domain.severityLabel} (Score {domain.score}/10)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="badge"
                        style={{
                          background: isDirect
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isPartial
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(107, 114, 128, 0.2)',
                          color: isDirect ? '#34d399' : isPartial ? '#fbbf24' : '#9ca3af',
                          border: isDirect
                            ? '1px solid #059669'
                            : isPartial
                              ? '1px solid #d97706'
                              : '1px solid #4b5563',
                        }}
                      >
                        Circuit Mapping: {domain.circuitMappingStatus}
                      </span>
                      {isDirect && (
                        <button
                          onClick={() => setExplainerDomain(domain)}
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Why Mappable?
                        </button>
                      )}
                    </div>
                  </div>

                  {domain.mappedCircuitName && (
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '0.5rem',
                      }}
                    >
                      <span>Target Circuit:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {domain.mappedCircuitName}
                      </strong>
                      <span>({domain.evidenceTierBadge})</span>
                    </div>
                  )}

                  {/* Priority & Reordering Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.5rem',
                      marginTop: '0.25rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>
                        Priority <strong>#{domain.clinicalPriority}</strong>
                      </span>
                      <span>•</span>
                      <span>Importance:</span>
                      <select
                        value={domain.clinicalImportance}
                        onChange={e => handleImportanceChange(index, e.target.value as any)}
                        style={{
                          background: '#090d16',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.25rem',
                          padding: '0.15rem 0.4rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="High">High</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleMovePriority(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move ${domain.domainName} up`}
                        className="btn btn-secondary"
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMovePriority(index, 'down')}
                        disabled={index === domains.length - 1}
                        aria-label={`Move ${domain.domainName} down`}
                        className="btn btn-secondary"
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Patient Goals & Clinician Formulation Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Patient Functional Goals
            </h2>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              Goals influence clinical priority ordering but do not map directly to cortical
              coordinate systems.
            </p>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              {initialViewModel.patientGoals.map((goal, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Clinical Formulation Notes
            </h2>
            <div className="form-group">
              <label
                htmlFor="clinician-notes"
                className="form-label"
                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
              >
                Document contextual clinical formulation and justification:
              </label>
              <textarea
                id="clinician-notes"
                className="form-textarea"
                value={clinicianNotes}
                onChange={e => setClinicianNotes(e.target.value)}
                placeholder="Enter clinical rationale, safety observations, and patient presentation context..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phenotype Evidence Explainer Modal */}
      {explainerDomain && (
        <div className="modal-backdrop" onClick={() => setExplainerDomain(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Why is {explainerDomain.domainName} Target-Mappable?
              </h3>
              <button
                onClick={() => setExplainerDomain(null)}
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Evidence Status
                </span>
                <p style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {explainerDomain.evidenceTierBadge}
                </p>
              </div>

              <div>
                <strong style={{ color: '#34d399' }}>What this means:</strong>
                <p style={{ color: '#e2e8f0', marginTop: '0.25rem' }}>
                  A symptom-specific therapeutic circuit ({explainerDomain.mappedCircuitName}) has
                  been identified in replicated neuroimaging trials and demonstrated prospective
                  response in MDD patients exhibiting high burden in this specific domain.
                </p>
              </div>

              <div>
                <strong style={{ color: '#f87171' }}>What this does not mean:</strong>
                <p style={{ color: '#e2e8f0', marginTop: '0.25rem' }}>
                  This is not a standalone diagnostic biomarker, nor does it guarantee universal
                  superiority over established Tier 1 left DLPFC baseline coordinates for
                  unstratified patient presentations.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setExplainerDomain(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Phenotype Modal */}
      {showApprovalDialog && (
        <div className="modal-backdrop" onClick={() => setShowApprovalDialog(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Confirm Phenotype Approval
            </h3>

            <div
              style={{
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <p style={{ color: '#e2e8f0' }}>
                You are approving the clinical symptom formulation for{' '}
                <strong>{initialViewModel.primaryDiagnosis}</strong>.
              </p>

              <div
                style={{
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '0.875rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Highest Treatment Priority:
                  </span>
                  <strong>{domains[0]?.domainName}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Direct Circuit Mappings:</span>
                  <strong>{initialViewModel.targetMappableCount} circuits</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Safety Clearance:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Cleared for TMS</span>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#fbbf24' }}>
                ⚠ Magniom will seal this snapshot with a deterministic SHA-256 hash. Later
                modifications to clinically material priorities will mark downstream Target Slates
                as stale.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              <button
                onClick={() => setShowApprovalDialog(false)}
                className="btn btn-secondary"
                disabled={isApproving}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteApproval}
                className="btn btn-primary"
                disabled={isApproving}
                id="confirm-phenotype-approval-btn"
              >
                {isApproving ? 'Sealing Snapshot...' : 'Confirm & Generate Slate →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
