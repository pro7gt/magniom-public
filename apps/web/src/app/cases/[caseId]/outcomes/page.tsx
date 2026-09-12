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

export default function CaseOutcomesPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Outcomes Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Clinical Outcomes', current: true },
        ]}
      />
      <PageHeader
        title="Clinical Outcomes & Longitudinal Symptom Response"
        subtitle="Tracking MADRS, GAD-7, and clinical global impression trajectories across TMS treatment sessions."
        actions={
          <Button variant="primary" href={`/cases/${caseId}/audit`}>
            View Cryptographic Audit Trail <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        }
      />

      <div className="stat-card-grid">
        {/* Longitudinal Response Trajectory */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Depression Trajectory (MADRS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between p-2 bg-surface-elevated rounded-md">
                <span>Baseline (Session 0)</span>
                <strong>34 (Severe)</strong>
              </div>
              <div className="flex justify-between p-2 bg-surface-elevated rounded-md">
                <span>Mid-Treatment (Session 15)</span>
                <strong className="text-cyan">21 (Moderate — 38% reduction)</strong>
              </div>
              <div className="flex justify-between p-2 bg-surface-elevated rounded-md">
                <span>Post-Treatment (Session 30)</span>
                <strong className="text-emerald">11 (Mild / Near Remission — 68% reduction)</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Response Classification */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Clinical Response Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="text-secondary">Outcome Category:</span>
                <div className="mt-1">
                  <Badge variant="tier1" className="text-sm">
                    CLINICAL RESPONDER (≥ 50% MADRS Reduction)
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-secondary">Target Engagement Verification:</span>
                <p className="text-sm text-secondary mt-1">
                  Concordant with predicted therapeutic circuit engagement on sgACC anti-correlation
                  network.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
