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
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';

export default function CaseTreatmentPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  const isSigned = Boolean(record.decision?.isImmutable);

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Treatment History Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Treatment Prescription', current: true },
        ]}
      />
      <PageHeader
        title="TMS Treatment Prescription & Neuronavigation Plan"
        subtitle="Protocol dosing parameters, coil angle orientations, and neuronavigation export package."
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/decision`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Decision Record
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/outcomes`}>
              Clinical Outcomes <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        {/* Prescription Parameters */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              TMS Protocol Specification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Protocol Paradigm:</span>
                <strong>Intermittent Theta Burst (iTBS) / 10 Hz rTMS</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Stimulation Intensity:</span>
                <strong>120% Resting Motor Threshold (rMT)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Pulses per Session:</span>
                <strong>1,800 Pulses (600 iTBS x 3 trains)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Total Planned Sessions:</span>
                <strong>30 Sessions (6 weeks)</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Neuronavigation Export */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Neuronavigation Export Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary mb-3">
              {isSigned
                ? 'Signed clinical target coordinate sealed with SHA-256 attestation. Ready for Brainsight / Localite / Nexstim export.'
                : 'Target coordinates are provisional until clinical decision is formally signed and sealed.'}
            </p>
            <Button
              variant={isSigned ? 'primary' : 'secondary'}
              disabled={!isSigned}
              className="w-full text-sm"
            >
              {isSigned
                ? 'Export DICOM / Neuronavigation XML'
                : 'Signing Required for Clinical Export'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
