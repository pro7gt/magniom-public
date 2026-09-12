'use client';

import React, { use, useState, useEffect } from 'react';
import {
  CheckIcon,
  Breadcrumbs,
  Button,
  Badge,
  CaseNotFoundState,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';
import { useRouter } from 'next/navigation';
import { caseStore } from '../../../../lib/case-store';

export default function CaseIndicationsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;
  const router = useRouter();

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

  const activeCiId = record.activeCaseIndicationId;

  const handleSwitchIndication = (ciId: string) => {
    caseStore.switchCaseIndication(caseId, ciId);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    router.refresh();
  };

  return (
    <div className="container page-container-col">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        ariaLabel="Indications Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Indication Module Registry', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        variant="case-workspace"
        title="Case Indication Modules (§191–§194)"
        subtitle={
          <>
            Multi-indication target governance for patient{' '}
            <strong>{record.clinicalCase.patientId}</strong>. Each indication is validated
            independently under distinct scientific release controls.
          </>
        }
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Case Overview
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* Grid of Indication Modules */}
      <div className="grid-cards-340">
        {record.availableIndications.map(ind => {
          const isActive = ind.caseIndicationId === activeCiId;

          return (
            <article
              key={ind.caseIndicationId}
              className={`indication-module-card ${isActive ? 'indication-module-card-active' : ''}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <h2 className="m-0 text-lg text-primary font-bold">{ind.label}</h2>
                    <span className="text-xs text-muted font-mono">
                      {ind.caseIndicationId} · IMR-{ind.indicationCode}-2.0.0
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ind.isPrimary && <Badge variant="tier1">Primary</Badge>}
                    {isActive ? (
                      <Badge variant="tier1" className="badge-active-cyan">
                        ACTIVE
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-secondary leading-relaxed m-0 mb-4">
                  Status: <strong>{ind.status}</strong>. Full scientific policy configuration and
                  indication-specific measurements are active for this patient record.
                </p>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {!isActive ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSwitchIndication(ind.caseIndicationId)}
                    className="text-xs"
                  >
                    Activate {ind.indicationCode} Module
                  </Button>
                ) : (
                  <span className="text-xs text-cyan inline-flex items-center">
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> Currently Governing
                    Targeting
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/cases/${caseId}/indications/${ind.caseIndicationId}`}

                  className="text-xs"
                >
                  Indication View <ArrowRightIcon size={14} className="ml-1 inline" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
