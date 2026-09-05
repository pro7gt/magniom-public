'use client';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import type { CaseShellViewModel } from '@magniom/presentation';

export default function ClinicalContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

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
      </div>
    );
  }

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const indication = shellVm?.indication;
  const moduleAuthority = shellVm?.moduleAuthority;

  const effectiveObjective = record.clinicalObjective;
  const effectiveStage = record.diseaseStage;
  const effectiveLesion = record.lesionContext;
  const effectiveTreatment = record.treatmentContext;

  return (
    <div className="clinical-context-workspace" style={{ padding: '24px' }}>
      {/* Section Header (§93) */}
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 700 }}>
          Clinical Context
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Case-level clinical context governing Target Slate generation for{' '}
          <strong>{indication?.indicationFormatted || record.clinicalCase.indicationCode}</strong>.
        </p>
        {moduleAuthority && (
          <span
            className={`badge ${moduleAuthority.isClinicalAuthorised ? 'badge-tier1' : moduleAuthority.isResearchOnly ? 'badge-tierexp' : 'badge-tier2'}`}
            title={`Module: ${moduleAuthority.humanReadableName} (${moduleAuthority.moduleVersion})`}
            style={{ marginTop: '8px', display: 'inline-block' }}
          >
            {moduleAuthority.permissionLabel}
          </span>
        )}
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px',
        }}
      >
        {/* 1. Clinical Objective (§72, §93) */}
        <section
          className="context-card"
          aria-labelledby="ctx-objective-heading"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            id="ctx-objective-heading"
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Clinical Objective
          </h3>
          {effectiveObjective ? (
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-main)' }}>
                {effectiveObjective.title}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                  Priority: {effectiveObjective.priorityRank}
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
                <p
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}
                >
                  Burden: {effectiveObjective.burdenScoreText}
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No clinical objective has been set for this case. This is required before Target Slate
              generation.
            </p>
          )}
        </section>

        {/* 2. Disease Stage (§73, §93) */}
        <section
          className="context-card"
          aria-labelledby="ctx-stage-heading"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            id="ctx-stage-heading"
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Disease Stage
          </h3>
          {effectiveStage ? (
            <div>
              <span className="badge badge-neutral" style={{ fontSize: '0.85rem' }}>
                {effectiveStage.stageLabel}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Determination: {effectiveStage.determinationMethod}
              </p>
              {effectiveStage.isSubacuteOrAcute && (
                <span
                  className="badge badge-tier3"
                  style={{ fontSize: '0.8rem', marginTop: '6px', display: 'inline-block' }}
                >
                  ⚠ Subacute / Acute — Special targeting considerations apply
                </span>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Disease stage has not been determined for this case.
            </p>
          )}
        </section>

        {/* 3. Lesion Context (§74, §93) */}
        <section
          className="context-card"
          aria-labelledby="ctx-lesion-heading"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            id="ctx-lesion-heading"
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Lesion Context
          </h3>
          {effectiveLesion ? (
            <div>
              {effectiveLesion.hasLesion ? (
                <>
                  <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {effectiveLesion.laterality
                      ? `${effectiveLesion.laterality.toUpperCase()} `
                      : ''}
                    {effectiveLesion.lesionType || 'Lesion Present'}
                  </p>
                  {effectiveLesion.interpretation && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {effectiveLesion.interpretation}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                      Regions: {effectiveLesion.affectedRegionsCount}
                    </span>
                    {effectiveLesion.hasTargetOverlapWarning && (
                      <span className="badge badge-tier3" style={{ fontSize: '0.8rem' }}>
                        ⚠ Target Overlap Warning
                      </span>
                    )}
                    {effectiveLesion.skullAbnormalityPresent && (
                      <span className="badge badge-tier3" style={{ fontSize: '0.8rem' }}>
                        ⚠ Skull Abnormality
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>
                  No lesion documented. Standard targeting pathway applies.
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Lesion context has not been reviewed for this case.
            </p>
          )}
        </section>

        {/* 4. Treatment Context (§75, §93) */}
        <section
          className="context-card"
          aria-labelledby="ctx-treatment-heading"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            id="ctx-treatment-heading"
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Treatment Context
          </h3>
          {effectiveTreatment ? (
            <div>
              <span
                className={`badge ${effectiveTreatment.isConfirmed ? 'badge-tier1' : 'badge-neutral'}`}
                style={{ fontSize: '0.85rem' }}
              >
                {effectiveTreatment.statusLabel}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {effectiveTreatment.summaryText}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Treatment context has not been specified.
            </p>
          )}
        </section>
      </div>

      {/* Available Indications (§63–67) */}
      {record.availableIndications && record.availableIndications.length > 1 && (
        <section
          style={{
            marginTop: '24px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
          aria-labelledby="ctx-indications-heading"
        >
          <h3
            id="ctx-indications-heading"
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Available Case Indications
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            This patient case has {record.availableIndications.length} registered targeting
            indications. Each indication governs an independent clinical context and Target Slate
            (§66).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {record.availableIndications.map(ind => (
              <div
                key={ind.caseIndicationId}
                style={{
                  padding: '10px 16px',
                  backgroundColor:
                    ind.indicationCode === record.clinicalCase.indicationCode
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${ind.indicationCode === record.clinicalCase.indicationCode ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '6px',
                  minWidth: '200px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
                >
                  <strong style={{ color: 'var(--text-main)' }}>{ind.label}</strong>
                  {ind.isPrimary && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      Primary
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {ind.indicationCode}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
