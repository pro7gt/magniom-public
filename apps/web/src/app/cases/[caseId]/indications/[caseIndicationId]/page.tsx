'use client';

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Breadcrumbs,
  CaseNotFoundState,
  ArrowRightIcon,
  PageHeader,
} from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../../lib/case-store';
import { getModuleUiDescriptor } from '@magniom/presentation';

export default function CaseIndicationOverviewPage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const resolvedParams = use(params);
  const { caseId, caseIndicationId } = resolvedParams;

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

  useEffect(() => {
    const current = caseStore.getCaseRecord(caseId);
    if (current && current.activeCaseIndicationId !== caseIndicationId) {
      caseStore.switchCaseIndication(caseId, caseIndicationId);
      setRecord(caseStore.getCaseRecord(caseId));
    }
  }, [caseId, caseIndicationId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const matchingInd = record.availableIndications?.find(
    i => i.caseIndicationId === caseIndicationId,
  );
  const activeIndCode = matchingInd?.indicationCode || record.clinicalCase.indicationCode;
  const descriptor = getModuleUiDescriptor(activeIndCode);

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Indication Detail Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Indications', href: `/cases/${caseId}/indications` },
          { label: activeIndCode, current: true },
        ]}
      />
      {/* Indication Orientation Banner (§63) */}
      <Card>
        <CardContent>
          <PageHeader
            eyebrow={
              <span className="text-xs font-semibold text-cyan uppercase">
                INDICATION WORKSPACE CONTEXT
              </span>
            }
            title={descriptor.indication_name}
            subtitle={
              <>
                Case Code: <strong className="font-mono">{record.clinicalCase.caseCode}</strong> •
                Module: <strong>{descriptor.indication_module_release_id}</strong>
              </>
            }
            actions={
              <Button
                variant="primary"
                href={`/cases/${caseId}/targets`}
                id="review-target-slate-overview-btn"
              >
                Enter Target Workspace <ArrowRightIcon size={14} className="ml-1 inline" />
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Indication Clinical Question & Measurements */}
      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold text-secondary uppercase">
              CLINICAL OBJECTIVE
            </span>
            <CardTitle as="h2" className="mt-2">
              {record.clinicalObjective?.title ||
                `Targeting for ${record.clinicalCase.indicationCode}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary m-0">
              {record.clinicalObjective?.burdenScoreText
                ? `Current baseline burden: ${record.clinicalObjective.burdenScoreText}`
                : 'Clinical formulation active for this indication.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-xs font-semibold text-secondary uppercase">
              REQUIRED MEASUREMENTS
            </span>
          </CardHeader>
          <CardContent>
            <ul className="mt-2 pl-5 text-secondary text-sm m-0">
              {descriptor.measurement_sections.map(ms => (
                <li key={ms.modality}>
                  {ms.label} {ms.required ? '(Required)' : '(Optional / Research)'}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
