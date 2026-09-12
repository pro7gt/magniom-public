'use client';

import React, { use } from 'react';
import { Breadcrumbs, Button, Badge, Card, CardHeader, CardTitle, CardContent, ScientificState, ArrowRightIcon, ArrowLeftIcon, PageHeader, Alert } from '@/components/ui';

interface StudyRecord {
  id: string;
  title: string;
  module: string;
  protocol: string;
  participants: number;
  status: string;
  phase: string;
  description: string;
  primaryEndpoint: string;
}

const STUDIES: Record<string, StudyRecord> = {
  'VS-MDD-SILENT-001': {
    id: 'VS-MDD-SILENT-001',
    title: 'MDD Silent Prospective Study (Double-Blind)',
    module: 'MDD Indication Module 2.0',
    protocol: 'Silent Prospective Blinding Q5',
    participants: 42,
    status: 'Active',
    phase: 'Enrollment',
    description: 'Double-blind evaluation comparing clinical outcomes of clinician-selected TMS targets against MAGNIOM connectome-derived targets without unblinding during treatment course.',
    primaryEndpoint: 'MADRS reduction at Week 6 with blinding retention verification.',
  },
  'VS-PAIN-CAV-001': {
    id: 'VS-PAIN-CAV-001',
    title: 'Neuropathic Pain Clinician-Assisted Validation',
    module: 'Pain Indication Module 1.0',
    protocol: 'Clinician-Assisted Formative Q6',
    participants: 18,
    status: 'Active',
    phase: 'Data Collection',
    description: 'Formative human-factors evaluation of somatotopic homunculus coil positioning for intractable focal neuropathic pain.',
    primaryEndpoint: 'NRS pain score delta and motor threshold stability.',
  },
  'VS-STR-MOTOR-001': {
    id: 'VS-STR-MOTOR-001',
    title: 'Stroke Motor Module Validation',
    module: 'Stroke Motor Indication Module 1.0',
    protocol: 'Standard Multi-Center Q5',
    participants: 24,
    status: 'Planning',
    phase: 'Protocol Design',
    description: 'Subacute stroke motor rehabilitation protocol evaluating ipsilesional M1 stimulation in the presence of cortical lesions.',
    primaryEndpoint: 'Fugl-Meyer Upper Extremity (FMA-UE) change at 30 days post-stimulation.',
  },
};

export default function ValidationStudyDetailPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const resolvedParams = use(params);
  const studyId = resolvedParams.studyId;
  const study = STUDIES[studyId];

  if (!study) {
    return (
      <div className="container page-container-col">
        <Breadcrumbs
          ariaLabel="Study Breadcrumb"
          items={[
            { label: 'Validation', href: '/validation' },
            { label: 'Studies', href: '/validation/studies' },
            { label: studyId, current: true },
          ]}
        />
        <ScientificState
          variant="empty"
          title="Validation Study Not Found"
          message={`The requested validation study identifier (${studyId}) could not be located in the current validation registry.`}
          resolution="Verify the study identifier or return to the active validation studies registry."
        >
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="secondary" href="/validation/studies">
              Return to Validation Studies
            </Button>
          </div>
        </ScientificState>
      </div>
    );
  }

  return (
    <div className="container page-container-col">
      {/* Breadcrumbs */}
      <Breadcrumbs
        ariaLabel="Study Breadcrumb"
        items={[
          { label: 'Validation', href: '/validation' },
          { label: 'Studies', href: '/validation/studies' },
          { label: study.id, current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier2">VALIDATION ENVIRONMENT</Badge>
            <Badge variant="neutral">{study.id}</Badge>
            <Badge variant="tier1">{study.status}</Badge>
          </div>
        }
        title={study.title}
        subtitle={study.description}
      />


      {/* Grid */}
      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Protocol Specifications (§196)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
              <li className="flex justify-between">
                <span className="text-secondary">Governing Module:</span>
                <strong>{study.module}</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Protocol Classification:</span>
                <Badge variant="tier2">{study.protocol}</Badge>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Current Phase:</span>
                <strong>{study.phase}</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Enrolled Participants:</span>
                <strong className="font-mono">{study.participants} subjects</strong>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Endpoints &amp; Governance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary leading-relaxed mb-3">
              <strong>Primary Endpoint:</strong> {study.primaryEndpoint}
            </p>
            <Alert variant="info" className="text-xs" title="Safety Notice (§196):">
              Validation routes operate under protocol governance. Clinical decision signing is locked for blinded arms.
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" href="/validation/studies"><ArrowLeftIcon size={14} className="mr-1 inline" /> All Studies</Button>
        <Button variant="secondary" href="/validation/cases">Validation Cases <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/validation/golden">Golden Cases <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
