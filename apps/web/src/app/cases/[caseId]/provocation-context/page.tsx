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
  Textarea,
  RangeSlider,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function ProvocationContextPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [triggerText, setTriggerText] = useState(
    'Touching unsterilized clinic door handle without handwashing',
  );
  const [sudsScore, setSudsScore] = useState(65);
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
        'Symptom provocation context modified after slate generation',
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
        ariaLabel="Provocation Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'OCD Context', href: `/cases/${caseId}/ocd-context` },
          { label: 'Symptom Provocation Protocol', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Individualized Symptom Provocation Protocol"
        subtitle="State-Dependent CSTC Network Engagement & SUDS Trigger Hierarchy (§55, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/ocd-context`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> OCD Context
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
              Target Trigger Formulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Individualized Provocation Trigger Description</FormLabel>
                <Textarea
                  value={triggerText}
                  onChange={e => setTriggerText(e.target.value)}
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Target Subjective Units of Distress (SUDS): <strong>{sudsScore} / 100</strong>
                </FormLabel>
                <RangeSlider
                  min={30}
                  max={90}
                  value={sudsScore}
                  onChange={e => setSudsScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>30 (Minimal Anxiety)</span>
                  <span>50–70 (Target Therapeutic Range)</span>
                  <span>90 (Panic / Overwhelming)</span>
                </div>
              </FormGroup>

              <div className="panel-dark">
                <div className="text-emerald font-semibold text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Optimal State
                  Activation Profile
                </div>
                <p className="mt-1 text-xs text-secondary">
                  SUDS between 50 and 70 reliably engages hyperconnected anterior cingulate and
                  orbitofrontal nodes without triggering severe behavioral panic during coil
                  positioning.
                </p>
              </div>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Provocation Design
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Provocation protocol
                  confirmed
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              State-Dependent Neuromodulation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-secondary">
              <li className="panel-subtle">
                <strong className="text-primary block">Synaptic Plasticity Threshold:</strong>
                Stimulating a quiescent circuit produces weak or unpredictable synaptic depression.
                Brief provocation immediately prior to stimulation primes active NMDA receptor
                subunit trafficking.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Session Timing Discipline:</strong>
                Trigger exposure must occur precisely 5 minutes before the first rTMS pulse train.
                Response prevention is maintained throughout the stimulation session.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
