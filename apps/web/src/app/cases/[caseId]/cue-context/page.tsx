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

export default function CueContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [cueType, setCueType] = useState('Personalized Photographic & Olfactory Cues');
  const [cravingSurge, setCravingSurge] = useState(8.0);
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
        'Cue-reactivity context modified after slate generation',
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
        ariaLabel="Cue Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'SUD Context', href: `/cases/${caseId}/substance-context` },
          { label: 'Cue-Reactivity Protocol', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Cue-Reactivity Protocol & State Engagement"
        subtitle="Sensory Exposure Timing & Mesolimbic Dopaminergic Loop Modulation (§55, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/substance-context`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> SUD Context
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
            <CardTitle as="h2" className="section-subheading m-0">
              Exposure Stimuli Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Cue Modality & Paradigm</FormLabel>
                <Select value={cueType} onChange={e => setCueType(e.target.value)}>
                  <option>Personalized Photographic & Olfactory Cues</option>
                  <option>Standardized Video Consumption Clips (3 minutes)</option>
                  <option>Virtual Reality Paraphernalia Simulation</option>
                  <option>Auditory Social Pressure Scenario</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Provoked Craving Surge (VAS): <strong>{cravingSurge} / 10</strong>
                </FormLabel>
                <RangeSlider
                  min={1}
                  max={10}
                  step={0.5}
                  value={cravingSurge}
                  onChange={e => setCravingSurge(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>1 (No surge)</span>
                  <span>5 (Moderate craving)</span>
                  <span>10 (Maximum urge)</span>
                </div>
              </FormGroup>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Cue Protocol
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Cue exposure verified
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              State-Dependent Addiction Neurocircuitry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary leading-relaxed m-0">
              Pre-stimulating the ventral striatal reward network via sensory cue exposure opens an
              active reconsolidation window. Immediate high-frequency DLPFC stimulation strengthens
              executive cognitive control over automatic drug-seeking habits.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
