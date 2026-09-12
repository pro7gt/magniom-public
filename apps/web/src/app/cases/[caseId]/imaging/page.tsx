'use client';

import {
  Button,
  Badge,
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
import { caseStore } from '../../../../lib/case-store';

export default function CaseImagingPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  const connectomeQual = record.slate?.personalisationQualification;
  const isLowReliability = connectomeQual === 'limited';
  const isNotAcquired = !connectomeQual || connectomeQual === 'not_available';

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Neuroimaging Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Neuroimaging', current: true },
        ]}
      />
      <PageHeader
        title="Neuroimaging Acquisition QC & Technical Qualification"
        subtitle="Verification of T1w structural and BOLD resting-state fMRI technical quality metrics (Section 62)."
        actions={
          <Button variant="primary" href={`/cases/${caseId}/connectome`}>
            Inspect Connectome Maps <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        }
      />

      <div className="stat-card-grid">
        {/* Card 1: Structural QC */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              T1w Structural Acquisition
            </CardTitle>
            <Badge variant="tier1">QC PASS</Badge>
          </CardHeader>
          <CardContent className="gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Resolution:</span>
              <strong>0.8 mm isotropic (3D MPRAGE)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">SNR / CNR:</span>
              <strong className="text-emerald">32.4 (High SNR)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">MNI152 Non-linear Registration:</span>
              <strong className="text-emerald">Dice 0.94 (Optimal)</strong>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Resting-State fMRI QC */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Resting-State BOLD Series
            </CardTitle>
            <Badge
              className={`${isLowReliability ? 'badge-tier3' : isNotAcquired ? 'badge-neutral' : 'badge-tier1'}`}
            >
              {isLowReliability
                ? 'ELEVATED MOTION'
                : isNotAcquired
                  ? 'NOT ACQUIRED'
                  : 'QC QUALIFIED'}
            </Badge>
          </CardHeader>
          <CardContent className="gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Acquired Runs:</span>
              <strong>
                {isNotAcquired ? '0 Runs (Evidence Baseline Protocol)' : '3 Runs (30 mins total)'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Retained BOLD Time:</span>
              <strong>
                {isLowReliability ? '7.2 usable mins' : isNotAcquired ? 'N/A' : '27.4 usable mins'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Mean Framewise Displacement:</span>
              <strong
                className={
                  isLowReliability
                    ? 'text-amber'
                    : isNotAcquired
                      ? 'text-secondary'
                      : 'text-emerald'
                }
              >
                {isLowReliability
                  ? '0.38 mm (High)'
                  : isNotAcquired
                    ? 'N/A — Not Ordered in Protocol'
                    : '0.12 mm (Nominal)'}
              </strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
