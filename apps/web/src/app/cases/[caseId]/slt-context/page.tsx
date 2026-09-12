'use client';

import React, { use, useState, useEffect } from 'react';
import {
  CheckIcon,
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CaseNotFoundState,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
  Select,
  RangeSlider,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function SltContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [therapyType, setTherapyType] = useState('Semantic Feature Analysis (SFA) + CILT');
  const [bntScore, setBntScore] = useState(28);
  const [timingWindow, setTimingWindow] = useState('Within 30 minutes post-rTMS');
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );
    if (hasActiveSlate) {
      caseStore.setStaleness(
        caseId,
        true,
        'Concurrent SLT therapy context modified after slate generation',
        'blocking',
      );
    } else {
      caseStore.notify(caseId);
    }
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="SLT Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Aphasia Context', href: `/cases/${caseId}/aphasia-context` },
          { label: 'Concurrent Speech Therapy (SLT)', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Concurrent Speech-Language Therapy (SLT) Protocol"
        subtitle="Neuroplastic Priming Window & Behavioral Pairing Coordination (§54, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/aphasia-context`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Aphasia Context
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              SLT Protocol Specification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Primary Behavioral Intervention</FormLabel>
                <Select value={therapyType} onChange={e => setTherapyType(e.target.value)}>
                  <option>Semantic Feature Analysis (SFA) + CILT</option>
                  <option>Constraint-Induced Language Therapy (CILT)</option>
                  <option>Melodic Intonation Therapy (MIT)</option>
                  <option>Phonological Component Analysis (PCA)</option>
                  <option>Script Training for Conversational Fluency</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Boston Naming Test (BNT) Baseline: <strong>{bntScore} / 60</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={60}
                  value={bntScore}
                  onChange={e => setBntScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>0 (Severe Anomia)</span>
                  <span>30 (Moderate)</span>
                  <span>60 (Normal)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>Coupling Timing Window</FormLabel>
                <Select value={timingWindow} onChange={e => setTimingWindow(e.target.value)}>
                  <option>Within 30 minutes post-rTMS (Optimal Priming Window)</option>
                  <option>30–60 minutes post-rTMS</option>
                  <option>Concurrent during 1 Hz low-frequency stimulation</option>
                </Select>
              </FormGroup>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Concurrent SLT Plan
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> SLT coupling verified
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Neuroplastic Priming Mechanism
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm text-secondary">
              <p className="m-0">
                Under <strong>IMR-APHASIA-2.0.0</strong>, neuromodulation without concurrent
                behavioral therapy shows significantly reduced long-term retention.
              </p>
              <div className="panel-dark">
                <strong className="text-primary block mb-1">
                  Long-Term Potentiation (LTP) Priming:
                </strong>
                <span>
                  rTMS creates a temporary (45-minute) neuroplastic state by lowering synaptic
                  depolarization thresholds in peri-infarct language cortex.
                </span>
              </div>
              <div className="panel-dark">
                <strong className="text-primary block mb-1">Hebbian Synaptic Stabilization:</strong>
                <span>
                  Concurrent speech therapy (SLT) activates semantic nodes during the heightened
                  plasticity window, structurally stabilizing synaptic weights.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
