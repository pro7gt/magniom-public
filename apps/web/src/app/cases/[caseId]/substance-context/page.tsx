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
  Select,
  RangeSlider,
  Input,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function SubstanceContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [substance, setSubstance] = useState('Alcohol Use Disorder (AUD)');
  const [dsmSeverity, setDsmSeverity] = useState('Severe (6+ DSM-5 Criteria)');
  const [cravingScore, setCravingScore] = useState(7.5);
  const [abstinenceWeeks, setAbstinenceWeeks] = useState(4);
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
    caseStore.approvePhenotype(
      caseId,
      'clin-specialist-001',
      `Substance Use Disorder: Craving ${cravingScore}/10, Substance: ${substance}, Severity: ${dsmSeverity}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="SUD Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Substance Use Disorder Context', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Substance Use Disorder (SUD) Clinical Formulation"
        subtitle="DSM-5 Severity, Craving Dynamics & Cortico-Striato-Insular Circuit Modulation (§55, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/cue-context`}>
              Cue Exposure Protocol <ArrowRightIcon size={14} className="ml-1 inline" />
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
              Substance Taxonomy & Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Primary Substance of Dependence</FormLabel>
                <Select value={substance} onChange={e => setSubstance(e.target.value)}>
                  <option>Alcohol Use Disorder (AUD)</option>
                  <option>Tobacco / Nicotine Dependence</option>
                  <option>Cocaine / Psychostimulant Use Disorder</option>
                  <option>Opioid Use Disorder (Stabilized on MAT)</option>
                  <option>Cannabis Use Disorder</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>DSM-5 Diagnostic Severity</FormLabel>
                <Select value={dsmSeverity} onChange={e => setDsmSeverity(e.target.value)}>
                  <option>Severe (6+ DSM-5 Criteria)</option>
                  <option>Moderate (4–5 Criteria)</option>
                  <option>Mild (2–3 Criteria)</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Baseline Craving Intensity (VAS): <strong>{cravingScore} / 10</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={10}
                  step={0.5}
                  value={cravingScore}
                  onChange={e => setCravingScore(Number(e.target.value))}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Verified Abstinence Duration: <strong>{abstinenceWeeks} weeks</strong>
                </FormLabel>
                <Input
                  type="number"
                  min="1"
                  max="104"
                  value={abstinenceWeeks}
                  onChange={e => setAbstinenceWeeks(Number(e.target.value))}
                />
              </FormGroup>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Addiction Formulation
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Formulation saved
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Frontostriatal Addiction Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-secondary">
              <li className="panel-subtle">
                <strong className="text-primary block">Left DLPFC (Executive Control):</strong>
                High-frequency (10–20 Hz) stimulation to enhance top-down prefrontal inhibitory
                control over striatal craving urges.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Bilateral Insular Cortex / Deep TMS:</strong>
                Deep H-coil or angled figure-8 targeting anterior insula to dampen visceral
                interoceptive craving representations.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
