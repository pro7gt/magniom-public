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

export default function ConnectomeModelingPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
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
        ariaLabel="Connectome Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Connectome Modeling', current: true },
        ]}
      />
      <PageHeader
        title="Functional Connectome & Therapeutic Circuit Concordance"
        subtitle="Patient-specific seed-to-voxel functional connectivity maps and spatial test-retest reliability regions (Section 63)."
        actions={
          <Button variant="primary" href={`/cases/${caseId}/targets`}>
            Enter Target Slate Workspace <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        }
      />

      <div className="stat-card-grid">
        {/* sgACC Circuit Anti-Correlation */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              sgACC Anti-Correlation (BA25 Seed)
            </CardTitle>
            <Badge className={`${isNotAcquired ? 'badge-neutral' : 'badge-tier1'}`}>
              {isNotAcquired ? 'BASELINE EVIDENCE' : 'TC-MDD-CONVERGENT-001'}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary mb-3">
              {isNotAcquired
                ? 'Resting-state BOLD series not acquired for this case. Using normative evidence baseline target coordinates.'
                : 'Resting-state BOLD time series correlation with bilateral subgenual anterior cingulate cortex seed (MNI ±6, 24, -11).'}
            </p>
            <div className="p-3 rounded text-sm flex flex-col gap-1.5 bg-primary">
              <div className="flex justify-between">
                <span className="text-secondary">Target Center Focus:</span>
                <strong className="font-mono text-cyan">(-42.4, +43.8, +29.2) MNI</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Correlation Status:</span>
                <strong className={isNotAcquired ? 'text-secondary' : 'text-emerald'}>
                  {isNotAcquired
                    ? 'Normative Baseline (r = -0.38)'
                    : 'Patient Specific (r = -0.42)'}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spatial Reliability Region */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Spatial Test-Retest Reliability Region
            </CardTitle>
            <Badge
              className={`${isLowReliability ? 'badge-tier3' : isNotAcquired ? 'badge-neutral' : 'badge-tier1'}`}
            >
              {isLowReliability
                ? 'Low Reliability'
                : isNotAcquired
                  ? 'Not Acquired / Baseline Evidence'
                  : 'High Consistency'}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary mb-3">
              {isNotAcquired
                ? 'Normative cohort reproducibility boundary from validated multicenter clinical trials.'
                : 'Split-half and cross-run spatial variance of the peak connectivity coordinates.'}
            </p>
            <div className="p-3 rounded text-sm flex flex-col gap-1.5 bg-primary">
              <div className="flex justify-between">
                <span className="text-secondary">Estimated Dispersion Radius:</span>
                <strong>
                  {isLowReliability
                    ? '± 11.4 mm'
                    : isNotAcquired
                      ? 'N/A (Structural Baseline)'
                      : '± 5.8 mm'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Figure-8 Coil Margin:</span>
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
                    ? 'Exceeds coil focal zone'
                    : isNotAcquired
                      ? 'Preserved Evidence Boundary'
                      : 'Within ~20mm FWHM E-field'}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
