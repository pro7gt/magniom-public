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
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function OcdContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [ybocsScore, setYbocsScore] = useState(29);
  const [dimension, setDimension] = useState('Contamination & Washing Compulsions');
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
      `OCD: Y-BOCS ${ybocsScore}/40, Primary Dimension: ${dimension}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="OCD Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'OCD Symptom Dimensions & Y-BOCS', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Obsessive-Compulsive Disorder Clinical Formulation"
        subtitle="Y-BOCS Severity, CSTC Circuit Endophenotypes & Provocation Protocol (§55, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/provocation-context`}>
              Provocation Protocol <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/measurements/efield`}>
              E-field Modeling <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              OCD Characterisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Dominant Symptom Dimension</FormLabel>
                <Select value={dimension} onChange={e => setDimension(e.target.value)}>
                  <option>Contamination & Washing Compulsions</option>
                  <option>Symmetry, Ordering & Arranging</option>
                  <option>Taboo Intrusions & Religious Scrupulosity</option>
                  <option>Checking & Doubting / Harm Avoidance</option>
                  <option>Hoarding & Saving Behavior</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Yale-Brown Obsessive Compulsive Scale (Y-BOCS): <strong>{ybocsScore} / 40</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={40}
                  value={ybocsScore}
                  onChange={e => setYbocsScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>0 (Subclinical)</span>
                  <span>16 (Moderate)</span>
                  <span>28 (Severe)</span>
                  <span>40 (Extreme)</span>
                </div>
              </FormGroup>

              <div className="panel-dark">
                <strong className="text-sm font-bold text-primary block mb-1">
                  Pharmacological Resistance Criteria (Gate G1)
                </strong>
                <div className="text-xs text-secondary flex flex-col gap-0.5">
                  <span>
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> Adequate trial of
                    2+ SSRIs at FDA maximum doses for ≥ 12 weeks
                  </span>
                  <span>
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> Failed exposure and
                    response prevention (ERP) behavioral therapy
                  </span>
                  <span>
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> Augmentation trial
                    (antipsychotic or glutamate agent) completed
                  </span>
                </div>
              </div>

              <Button type="submit" variant="primary">
                {isSaved ? 'Saved & Converged!' : 'Save & Recompute CSTC Convergence'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              CSTC Circuit Target Candidates (§55, §107)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-secondary">
              <li className="panel-subtle">
                <strong className="text-primary block">
                  Bilateral Supplementary Motor Area (SMA):
                </strong>
                Low-frequency (1 Hz) inhibitory rTMS targeted bilaterally to pre-SMA to downregulate
                hyperactive motor inhibition circuitry.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">
                  Dorsal Anterior Cingulate Cortex (dACC):
                </strong>
                High-frequency (20 Hz) deep TMS using custom Hesed H7-coil geometries aimed at
                error-detection overactivity in the conflict-monitoring node.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Left Orbitofrontal Cortex (OFC):</strong>
                Inhibitory theta-burst stimulation (cTBS) targeting hyperconnectivity between
                lateral OFC and ventral striatum.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
