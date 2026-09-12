'use client';

import {
  CheckIcon,
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
import { caseStore } from '../../../../lib/case-store';
import { toPhenotypeViewModel } from '@magniom/presentation';

export default function CaseAssessmentPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Clinical Assessment Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Clinical Assessment', current: true },
        ]}
      />
      <PageHeader
        title="Clinical Assessment & Baseline Evaluation"
        subtitle="Referral diagnostic history, baseline psychometric scores, and clinical eligibility for TMS therapy."
        actions={
          <Button variant="primary" href={`/cases/${caseId}/phenotype`}>
            Proceed to Phenotype Workspace <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        }
      />

      <div className="stat-card-grid">
        {/* Baseline Diagnostic Profile */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Diagnostic Formulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="text-secondary">Primary Diagnosis:</span>
                <div className="font-semibold text-primary mt-0.5">
                  {phenotypeVM.primaryDiagnosis}
                </div>
              </div>
              <div>
                <span className="text-secondary">Treatment Stage:</span>
                <div className="text-primary mt-0.5">
                  Treatment-Resistant Depression (Stage II — ≥ 2 failed antidepressant trials)
                </div>
              </div>
              <div>
                <span className="text-secondary">TMS Safety Qualification:</span>
                <div className="text-emerald font-semibold mt-0.5">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Cleared (No
                  ferromagnetic implants, no seizure history)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Baseline Psychometric Ratings */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Baseline Clinical Instruments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between p-2 bg-surface-elevated rounded-md">
                <span>MADRS Total Score</span>
                <strong className="text-amber">34 (Severe Depression)</strong>
              </div>
              <div className="flex justify-between p-2 bg-surface-elevated rounded-md">
                <span>GAD-7 Anxiety Score</span>
                <strong className="text-cyan">14 (Moderate-Severe)</strong>
              </div>
              <div className="flex justify-between p-2 bg-surface-elevated rounded-md">
                <span>PHQ-9 Total Score</span>
                <strong className="text-amber">19 (Moderately Severe)</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
