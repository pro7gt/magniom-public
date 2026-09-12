'use client';

import {
  AlertTriangleIcon,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Breadcrumbs,
  CaseNotFoundState,
  PageHeader,
} from '@/components/ui';

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
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
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
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Clinical Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Clinical Context', current: true },
        ]}
      />
      {/* Section Header (§93) */}
      <PageHeader
        title="Clinical Context"
        subtitle={
          <span>
            Case-level clinical context governing Target Slate generation for{' '}
            <strong>{indication?.indicationFormatted || record.clinicalCase.indicationCode}</strong>
            .
          </span>
        }
        actions={
          moduleAuthority && (
            <Badge
              className={`${moduleAuthority.isClinicalAuthorised ? 'badge-tier1' : moduleAuthority.isResearchOnly ? 'badge-tierexp' : 'badge-tier2'}`}
              title={`Module: ${moduleAuthority.humanReadableName} (${moduleAuthority.moduleVersion})`}
            >
              {moduleAuthority.permissionLabel}
            </Badge>
          )
        }
      />

      <div className="grid-cards-340">
        {/* 1. Clinical Objective (§72, §93) */}
        <Card className="context-card" aria-labelledby="ctx-objective-heading">
          <CardHeader>
            <CardTitle as="h2" id="ctx-objective-heading" className="section-subheading m-0">
              Clinical Objective
            </CardTitle>
          </CardHeader>
          <CardContent>
            {effectiveObjective ? (
              <div>
                <p className="m-0 mb-2 font-semibold text-primary">{effectiveObjective.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="neutral" className="text-xs">
                    Priority: {effectiveObjective.priorityRank}
                  </Badge>
                  <Badge
                    className={`${effectiveObjective.isEvidenceMappable ? 'badge-tier1' : 'badge-neutral'} text-xs`}
                  >
                    {effectiveObjective.isEvidenceMappable
                      ? 'Evidence Mappable'
                      : 'Not Directly Mapped'}
                  </Badge>
                </div>
                {effectiveObjective.burdenScoreText && (
                  <p className="text-sm text-secondary mt-2">
                    Burden: {effectiveObjective.burdenScoreText}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted italic">
                No clinical objective has been set for this case. This is required before Target
                Slate generation.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 2. Disease Stage (§73, §93) */}
        <Card className="context-card" aria-labelledby="ctx-stage-heading">
          <CardHeader>
            <CardTitle as="h2" id="ctx-stage-heading" className="section-subheading m-0">
              Disease Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {effectiveStage ? (
              <div>
                <Badge variant="neutral" className="text-sm">
                  {effectiveStage.stageLabel}
                </Badge>
                <p className="text-sm text-secondary mt-2">
                  Determination: {effectiveStage.determinationMethod}
                </p>
                {effectiveStage.isSubacuteOrAcute && (
                  <Badge variant="tier3" className="text-xs mt-1.5 inline-block">
                    <AlertTriangleIcon size={14} className="text-amber mr-1 inline" /> Subacute /
                    Acute — Special targeting considerations apply
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-muted italic">
                Disease stage has not been determined for this case.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 3. Lesion Context (§74, §93) */}
        <Card className="context-card" aria-labelledby="ctx-lesion-heading">
          <CardHeader>
            <CardTitle as="h2" id="ctx-lesion-heading" className="section-subheading m-0">
              Lesion Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            {effectiveLesion ? (
              <div>
                {effectiveLesion.hasLesion ? (
                  <>
                    <p className="m-0 mb-2 font-semibold text-primary">
                      {effectiveLesion.laterality
                        ? `${effectiveLesion.laterality.toUpperCase()} `
                        : ''}
                      {effectiveLesion.lesionType || 'Lesion Present'}
                    </p>
                    {effectiveLesion.interpretation && (
                      <p className="text-sm text-secondary">{effectiveLesion.interpretation}</p>
                    )}
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      <Badge variant="neutral" className="text-xs">
                        Regions: {effectiveLesion.affectedRegionsCount}
                      </Badge>
                      {effectiveLesion.hasTargetOverlapWarning && (
                        <Badge variant="tier3" className="text-xs">
                          <AlertTriangleIcon size={14} className="text-amber mr-1 inline" /> Target
                          Overlap Warning
                        </Badge>
                      )}
                      {effectiveLesion.skullAbnormalityPresent && (
                        <Badge variant="tier3" className="text-xs">
                          <AlertTriangleIcon size={14} className="text-amber mr-1 inline" /> Skull
                          Abnormality
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-secondary">
                    No lesion documented. Standard targeting pathway applies.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted italic">
                Lesion context has not been reviewed for this case.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 4. Treatment Context (§75, §93) */}
        <Card className="context-card" aria-labelledby="ctx-treatment-heading">
          <CardHeader>
            <CardTitle as="h2" id="ctx-treatment-heading" className="section-subheading m-0">
              Treatment Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            {effectiveTreatment ? (
              <div>
                <Badge
                  className={`${effectiveTreatment.isConfirmed ? 'badge-tier1' : 'badge-neutral'} text-sm`}
                >
                  {effectiveTreatment.statusLabel}
                </Badge>
                <p className="text-sm text-secondary mt-2">{effectiveTreatment.summaryText}</p>
              </div>
            ) : (
              <p className="text-muted italic">Treatment context has not been specified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Indications (§63–67) */}
      {record.availableIndications && record.availableIndications.length > 1 && (
        <Card className="mt-6" aria-labelledby="ctx-indications-heading">
          <CardHeader>
            <CardTitle as="h2" id="ctx-indications-heading" className="section-subheading m-0">
              Available Case Indications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary mb-3">
              This patient case has {record.availableIndications.length} registered targeting
              indications. Each indication governs an independent clinical context and Target Slate
              (§66).
            </p>
            <div className="flex flex-wrap gap-2">
              {record.availableIndications.map(ind => (
                <div
                  key={ind.caseIndicationId}
                  className={`indication-chip ${ind.indicationCode === record.clinicalCase.indicationCode ? 'indication-chip-active' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-primary">{ind.label}</strong>
                    {ind.isPrimary && (
                      <Badge variant="neutral" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-secondary font-mono">{ind.indicationCode}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
