'use client';

import {
  Button,
  Badge,
  Breadcrumbs,
  CaseNotFoundState,
  ScientificState,
  ArrowRightIcon,
  PageHeader,
} from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import type { MeasurementSummaryViewModel, CaseShellViewModel } from '@magniom/presentation';

export default function MeasurementsPage({ params }: { params: Promise<{ caseId: string }> }) {
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
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
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
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Measurements Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Clinical Measurements', current: true },
        ]}
      />
      {/* Section Header (§96) */}
      <PageHeader
        title="Measurements"
        subtitle={
          <>
            Module-specific measurement modalities for{' '}
            <strong>{indication?.indicationFormatted || record.clinicalCase.indicationCode}</strong>
            . Zero false measurement requirements are enforced per §87.
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className={`${allRequiredQualified ? 'badge-tier1' : 'badge-tier3'}`}>
              {allRequiredQualified ? 'All Required Qualified' : 'Required Measurements Pending'}
            </Badge>
            {moduleAuthority && (
              <Badge variant="neutral" className="font-mono text-xs">
                {moduleAuthority.moduleCode} v{moduleAuthority.moduleVersion}
              </Badge>
            )}
          </div>
        }
      />

      {/* Required Measurements (§97–99) */}
      {requiredMeasurements.length > 0 && (
        <section className="mb-6">
          <h2 className="section-subheading m-0 mb-4">Required Modalities</h2>
          <div className="grid-cards-340">
            {requiredMeasurements.map(m => {
              const q = getQualificationBadge(m);
              const cardModifier =
                m.qualification === 'qualified'
                  ? 'measurement-card-qualified'
                  : m.qualification === 'failed'
                    ? 'measurement-card-failed'
                    : 'measurement-card-other';
              return (
                <article key={m.modality} className={`measurement-card ${cardModifier}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="m-0 text-primary text-base font-semibold">{m.modalityLabel}</h3>
                    <Badge className={`${q.badge} text-xs`}>{q.label}</Badge>
                  </div>
                  <div className="text-sm text-secondary flex flex-col gap-1">
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
                    <span className="mt-1">
                      {m.isUsedForClinicalRanking ? (
                        <Badge variant="tier1" className="text-xs">
                          Used for Clinical Ranking
                        </Badge>
                      ) : (
                        <>
                          <Badge variant="tierexp" className="text-xs">
                            Not used for Clinical Ranking
                          </Badge>
                          {m.nonUseExplanation && (
                            <span className="block text-xs text-muted mt-0.5">
                              {m.nonUseExplanation}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        href={`/cases/${caseId}/measurements/${m.modality.toLowerCase().replace(/_/g, '-')}`}
                        className="text-xs py-1 px-2.5"
                      >
                        Inspect Modality Details{' '}
                        <ArrowRightIcon size={14} className="ml-1 inline" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Optional / Research Measurements (§100, §225–228) */}
      {optionalMeasurements.length > 0 && (
        <section className="mb-6">
          <h2 className="section-subheading m-0 mb-4">Optional / Research Modalities</h2>
          <div className="grid-cards-340">
            {optionalMeasurements.map(m => {
              const q = getQualificationBadge(m);
              return (
                <article key={m.modality} className="measurement-card measurement-card-optional">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="m-0 text-primary text-base font-semibold">{m.modalityLabel}</h3>
                    <div className="flex gap-1.5">
                      <Badge className={`${q.badge} text-xs`}>{q.label}</Badge>
                      <Badge variant="tierexp" className="text-xs">
                        Optional
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-secondary m-0">
                    {m.reliabilitySummary || 'Optional modality for enhanced targeting context.'}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      href={`/cases/${caseId}/measurements/${m.modality.toLowerCase().replace(/_/g, '-')}`}
                      className="text-xs py-1 px-2.5"
                    >
                      Inspect Modality Details <ArrowRightIcon size={14} className="ml-1 inline" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State (§206) */}
      {measurements.length === 0 && (
        <ScientificState
          variant="empty"
          title="No Measurements Registered"
          message="No measurement modalities have been qualified or registered for this case record."
          resolution="Inspect indication requirements in the clinical module specification or upload pending modalities."
        />
      )}
    </div>
  );
}
