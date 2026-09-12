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
  PageHeader,
  FormGroup,
  FormLabel,
  Select,
  RangeSlider,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function AphasiaContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [aphasiaType, setAphasiaType] = useState("Broca's Aphasia (Non-fluent / Expressive)");
  const [wabScore, setWabScore] = useState(48.2);
  const [comprehensionScore, setComprehensionScore] = useState(7.5);
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
    return <CaseNotFoundState caseId={caseId} />;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Cases', href: '/cases' },
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Aphasia Protocol Context', current: true },
        ]}
      />

      <PageHeader
        eyebrow="POST-STROKE NEUROMODULATION PROTOCOL"
        title="Post-Stroke Aphasia Clinical Context"
        subtitle="Specify syndromic aphasia taxonomy, language battery performance, and protocol-specific perilesional cortical target convergence."
        actions={
          <Button variant="secondary" href={`/cases/${caseId}/slt-context`}>
            Speech-Language Therapy Context <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Aphasia Profile &amp; Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Syndromic Aphasia Classification</FormLabel>
                <Select value={aphasiaType} onChange={e => setAphasiaType(e.target.value)}>
                  <option>Broca&apos;s Aphasia (Non-fluent / Expressive)</option>
                  <option>Wernicke&apos;s Aphasia (Fluent / Receptive)</option>
                  <option>Conduction Aphasia (Repetition Deficit)</option>
                  <option>Anomic Aphasia (Naming Deficit)</option>
                  <option>Global Aphasia (Severe Compound)</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Western Aphasia Battery (WAB-R) AQ: <strong>{wabScore} / 100</strong>
                </FormLabel>
                <RangeSlider
                  min="0"
                  max="100"
                  step="0.1"
                  value={wabScore}
                  onChange={e => setWabScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>0 (Global Plega)</span>
                  <span>50 (Moderate Non-Fluent)</span>
                  <span>93.8 (Cutoff for Normal)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Auditory Verbal Comprehension Subscore: <strong>{comprehensionScore} / 10</strong>
                </FormLabel>
                <RangeSlider
                  min="0"
                  max="100"
                  step="0.5"
                  value={comprehensionScore}
                  onChange={e => setComprehensionScore(Number(e.target.value))}
                />
              </FormGroup>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Aphasia Profile
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Aphasia profile
                  confirmed
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Language Circuit Targeting Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-secondary">
              <li className="panel-subtle">
                <strong className="text-primary block">
                  Left IFG (Pars Triangularis/Opercularis):
                </strong>
                Facilitatory high-frequency rTMS or iTBS applied to residual left inferior frontal
                gyrus (Broca&apos;s area) to stimulate perilesional expressive language recovery.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Right IFG (Homologue Inhibition):</strong>
                Inhibitory 1 Hz rTMS or cTBS targeted to the contralesional right pars triangularis
                to reduce maladaptive right-hemisphere transcallosal suppression of the recovering
                left language network.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Wernicke Posterior STG:</strong>
                For severe auditory comprehension deficits, secondary cortical stimulation over left
                superior temporal gyrus margin.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
