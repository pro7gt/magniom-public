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
  RangeSlider,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { EnvironmentSafetyStrip } from '@/components/shell';
import { caseStore } from '../../../../lib/case-store';

export default function TbiContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [gcsScore, setGcsScore] = useState(13);
  const [ptaDurationDays, setPtaDurationDays] = useState(3);
  const [rpqScore, setRpqScore] = useState(34);
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
      `TBI Profile: GCS ${gcsScore}, PTA ${ptaDurationDays}d, RPQ ${rpqScore}/64`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="TBI Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'TBI Severity & Trauma Context', current: true },
        ]}
      />

      {/* Research Mode Safety Banner (§20–25) */}
      <EnvironmentSafetyStrip
        mode="RESEARCH"
        className="mb-5"
        title="RESEARCH MODE ONLY (IMR-TBI-2.0.0 · Q0 Qualification Level)"
        description="Traumatic brain injury neuromodulation is under controlled exploratory validation. Targets are computational research hypotheses."
      />

      <PageHeader
        variant="case-workspace"
        title="Traumatic Brain Injury Severity & Diffuse Axonal Injury"
        subtitle="GCS, PTA, Rivermead Post-Concussion Inventory & White Matter Tract Integrity (§56, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/measurements/dwi`}>
              DWI Tractography <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Research Hypotheses <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Trauma Metrics & Severity Indices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>
                  Glasgow Coma Scale (GCS) at Presentation: <strong>{gcsScore} / 15</strong>
                </FormLabel>
                <RangeSlider
                  min={3}
                  max={15}
                  value={gcsScore}
                  onChange={e => setGcsScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>3–8 (Severe)</span>
                  <span>9–12 (Moderate)</span>
                  <span>13–15 (Mild / Concussion)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Post-Traumatic Amnesia (PTA): <strong>{ptaDurationDays} days</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={30}
                  value={ptaDurationDays}
                  onChange={e => setPtaDurationDays(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>&lt; 1 hr (Very Mild)</span>
                  <span>1–24 hrs (Moderate)</span>
                  <span>&gt; 7 days (Very Severe)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Rivermead Post-Concussion Questionnaire (RPQ): <strong>{rpqScore} / 64</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={64}
                  value={rpqScore}
                  onChange={e => setRpqScore(Number(e.target.value))}
                />
              </FormGroup>

              <Button variant="primary" type="submit" className="self-start">
                Confirm TBI Parameters
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> TBI context confirmed
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Diffuse Axonal Injury & Network Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="rule-list">
              <li className="panel-subtle">
                <strong className="text-primary block">White Matter Shearing:</strong>
                DWI tractography is mandatory under IMR-TBI-2.0.0 to detect microstructural axonal
                disconnection in the corpus callosum and superior longitudinal fasciculus.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Seizure Risk Thresholds:</strong>
                Post-traumatic epilepsy risk is elevated; algorithm bounds maximum stimulation
                frequency and enforces mandatory 20-second inter-train intervals.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
