'use client';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import type { MeasurementSummaryViewModel, CaseShellViewModel } from '@magniom/presentation';

export default function MeasurementsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
  }, [caseId]);

  if (!record) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Case ID {caseId} does not exist in the active case store.
        </p>
      </div>
    );
  }

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const measurements: readonly MeasurementSummaryViewModel[] = shellVm?.measurements ?? [];
  const moduleAuthority = shellVm?.moduleAuthority;
  const indication = shellVm?.indication;

  const requiredMeasurements = measurements.filter(m => m.isRequiredByModule);
  const optionalMeasurements = measurements.filter(m => !m.isRequiredByModule);

  const allRequiredQualified = requiredMeasurements.every(
    m => m.qualification === 'qualified' || m.qualification === 'qualified_with_limits',
  );

  // Status badge helper
  const getQualificationBadge = (m: MeasurementSummaryViewModel) => {
    switch (m.qualification) {
      case 'qualified':
        return { label: 'Qualified', badge: 'badge-tier1' };
      case 'qualified_with_limits':
        return { label: 'Qualified (Limits)', badge: 'badge-tier2' };
      case 'low_reliability':
        return { label: 'Low Reliability', badge: 'badge-tier3' };
      case 'failed':
        return { label: 'Failed QC', badge: 'badge-tier3' };
      case 'not_required':
        return { label: 'Not Required', badge: 'badge-neutral' };
      case 'research_only':
        return { label: 'Research Only', badge: 'badge-tierexp' };
      default:
        return { label: 'Pending', badge: 'badge-neutral' };
    }
  };

  return (
    <div className="measurements-workspace" style={{ padding: '24px' }}>
      {/* Section Header (§96) */}
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 700 }}>
              Measurements
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Module-specific measurement modalities for{' '}
              <strong>{indication?.indicationFormatted || record.clinicalCase.indicationCode}</strong>.
              Zero false measurement requirements are enforced per §87.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge ${allRequiredQualified ? 'badge-tier1' : 'badge-tier3'}`}>
              {allRequiredQualified ? '✓ All Required Qualified' : '⚠ Required Measurements Pending'}
            </span>
            {moduleAuthority && (
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {moduleAuthority.moduleCode} v{moduleAuthority.moduleVersion}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Required Measurements (§97–99) */}
      {requiredMeasurements.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Required Modalities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {requiredMeasurements.map(m => {
              const q = getQualificationBadge(m);
              return (
                <article
                  key={m.modality}
                  className="measurement-card"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    borderLeft: `3px solid ${m.qualification === 'qualified' ? '#10b981' : m.qualification === 'failed' ? '#ef4444' : '#6366f1'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>
                      {m.modalityLabel}
                    </h4>
                    <span className={`badge ${q.badge}`} style={{ fontSize: '0.8rem' }}>
                      {q.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>
                      Availability: <strong>{m.isAvailable ? 'Available' : 'Not Available'}</strong>
                    </span>
                    {m.uiStatus && (
                      <span>
                        Status: <strong>{m.uiStatus}</strong>
                      </span>
                    )}
                    {m.reliabilitySummary && (
                      <span>
                        Reliability: <strong>{m.reliabilitySummary}</strong>
                      </span>
                    )}
                    {/* Clinical ranking disclosure (§225–228) */}
                    <span style={{ marginTop: '4px' }}>
                      {m.isUsedForClinicalRanking ? (
                        <span className="badge badge-tier1" style={{ fontSize: '0.75rem' }}>
                          Used for Clinical Ranking
                        </span>
                      ) : (
                        <>
                          <span className="badge badge-tierexp" style={{ fontSize: '0.75rem' }}>
                            Not used for Clinical Ranking
                          </span>
                          {m.nonUseExplanation && (
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {m.nonUseExplanation}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Optional / Research Measurements (§100, §225–228) */}
      {optionalMeasurements.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Optional / Research Modalities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {optionalMeasurements.map(m => {
              const q = getQualificationBadge(m);
              return (
                <article
                  key={m.modality}
                  className="measurement-card"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    opacity: 0.85,
                    borderLeft: '3px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>
                      {m.modalityLabel}
                    </h4>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className={`badge ${q.badge}`} style={{ fontSize: '0.8rem' }}>
                        {q.label}
                      </span>
                      <span className="badge badge-tierexp" style={{ fontSize: '0.75rem' }}>
                        Optional
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {m.reliabilitySummary || 'Optional modality for enhanced targeting context.'}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State (§206) */}
      {measurements.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
            No measurements have been registered for this case.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
            Measurement modalities are defined by the governing indication module. Consult the
            module specification for required acquisitions.
          </p>
        </div>
      )}
    </div>
  );
}
