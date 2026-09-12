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
} from '@/components/ui';
import { EnvironmentSafetyStrip } from '@/components/shell';
import { caseStore } from '../../../../../../lib/case-store';

export default function ResearchCaseIndicationPage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const resolvedParams = use(params);
  const { caseId, caseIndicationId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const ind =
    record.availableIndications.find(i => i.caseIndicationId === caseIndicationId) ||
    record.availableIndications[0]!;

  return (
    <div className="container page-container-col">
      {/* Research Mode Persistent Safety Banner (§20–25, §57) */}
      <EnvironmentSafetyStrip
        mode="RESEARCH"
        className="mb-5"
        title="RESEARCH ENVIRONMENT: EXPLORATORY NEUROIMAGING WORKSPACE (§195)"
        description="Clinical decision sign-off and treatment prescription are strictly locked. All targeting outputs represent exploratory computational hypotheses."
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        ariaLabel="Research Breadcrumb"
        items={[
          { label: 'Research', href: '/research' },
          { label: 'Research Cases', href: '/research/cases' },
          { label: `${record.clinicalCase.caseCode} · ${ind.indicationCode}`, current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        variant="case-workspace"
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tierexp">RESEARCH MODE</Badge>
            <Badge variant="neutral">{caseIndicationId}</Badge>
          </div>
        }
        title={`${ind.label} Research Analysis`}
        subtitle={
          <span>
            Subject Token: <strong>SUBJ-{record.clinicalCase.patientId}</strong> · Protocol:
            Retrospective Connectome Mapping
          </span>
        }
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/targets`}>
              View Target Hypotheses <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="secondary" href="/research/cases">
              All Research Cases
            </Button>
          </>
        }
      />

      {/* Grid */}
      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Research Target Invariants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 list-none p-0 m-0 text-sm">
              <li className="flex justify-between">
                <span className="text-secondary">Module Release:</span>
                <strong className="text-primary">IMR-{ind.indicationCode}-2.0.0</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Qualification Gate:</span>
                <strong className="text-amber">Q0 (Exploratory / Research)</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Clinical Decision:</span>
                <strong className="text-rose">Strictly Suppressed (§57)</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Export Format:</span>
                <strong className="text-primary">Anonymized NIfTI Hypotheses</strong>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
