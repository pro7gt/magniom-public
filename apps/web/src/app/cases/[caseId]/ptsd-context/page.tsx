'use client';

import React, { use, useState, useEffect } from 'react';
import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CaseNotFoundState,
  ArrowRightIcon,
  PageHeader,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function PtsdContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    return caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const handleConfirmFormulation = () => {
    caseStore.approvePhenotype(
      caseId,
      'clin-specialist-001',
      'PTSD CAPS-5 total 48/80 (Severe), Right DLPFC candidate hypothesis certified',
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        ariaLabel="PTSD Context Breadcrumb"
        items={[
          { label: 'Cases', href: '/cases' },
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'PTSD Clinical Formulation', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        variant="case-workspace"
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>PTSD Symptom Formulation &amp; Battery (§70–§72)</span>
            <Badge variant="tier1">CLINICIAN CERTIFIED</Badge>
            <Badge variant="neutral">IMR-PTSD-2.0.0</Badge>
          </span>
        }
        subtitle="Structured diagnostic evaluation: Clinician-Administered PTSD Scale (CAPS-5) & PCL-5 baseline severity."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              onClick={handleConfirmFormulation}
              id="confirm-ptsd-phenotype-btn"
            >
              {isSaved ? 'Formulation Sealed' : 'Confirm & Seal Formulation'}
            </Button>
            <Button variant="secondary" href={`/cases/${caseId}/trauma-context`}>
              Trauma Screening <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="secondary" href={`/cases/${caseId}/targets`}>
              Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </div>
        }
      />

      {/* 3-Column Diagnostic Card Grid */}
      <div className="grid-cards-320 mb-6">
        {/* Card 1: Baseline Severity */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              CAPS-5 Diagnostic Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-extrabold text-primary font-mono">48</span>
              <span className="text-base text-secondary">/ 80 (Severe PTSD)</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Criterion B (Intrusions):</span>
                <strong className="text-primary">14 / 20</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Criterion C (Avoidance):</span>
                <strong className="text-primary">7 / 8</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Criterion D (Cognition/Mood):</span>
                <strong className="text-primary">15 / 28</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Criterion E (Hyperarousal):</span>
                <strong className="text-warning">12 / 24</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Scientific Targeting Invariant (§72) */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Target Strategy &amp; Laterality Invariant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary leading-relaxed m-0 mb-3">
              Conforms to §72: Primary PTSD targeting hypothesis utilizes{' '}
              <strong>Right DLPFC (BA46/9)</strong> inhibitory / high-frequency fronto-limbic
              regulation, distinct from MDD Left DLPFC anti-correlation targeting.
            </p>
            <Alert variant="info" className="text-xs">
              <AlertTitle>Governing Evidence Path</AlertTitle>
              <AlertDescription>
                <div className="font-mono text-primary mt-0.5">EP-PTSD-RDLPFC-CIVILIAN-001</div>
                <Badge variant="tier1" className="mt-1.5 text-xs">
                  Level B Clinical Consensus
                </Badge>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Card 3: Comorbidity & MDD Independence (§70) */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Comorbidity Isolation Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary leading-relaxed m-0 mb-3">
              In accordance with §70, comorbid depressive symptoms remain isolated in independent
              CaseIndication records. Target Slates are never commingled.
            </p>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary">Comorbid MDD Status:</span>
                <Badge variant="neutral">Independent CaseIndication</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Left-DLPFC Alternative:</span>
                <Badge variant="tier2">Secondary Slot (Depressive Focus)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
