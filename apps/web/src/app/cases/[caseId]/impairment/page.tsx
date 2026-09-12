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
  Checkbox,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function StrokeImpairmentPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [fmaScore, setFmaScore] = useState(24);
  const [pareticSide, setPareticSide] = useState('Right Hemiparesis (Left Hemisphere Infarct)');
  const [ashworthScale, setAshworthScale] = useState(
    '1+ (Slight increase in tone, catch and release)',
  );
  const [hasFingerExtension, setHasFingerExtension] = useState(true);
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
      `Stroke Motor: FMA-UE ${fmaScore}/66, Side: ${pareticSide}, Ashworth: ${ashworthScale}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Stroke Impairment Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Stroke Motor Impairment', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Post-Stroke Motor Deficit & Baseline Metrics"
        subtitle="Fugl-Meyer Assessment, Spasticity & Residual Corticospinal Tract Potential (§54, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/stage`}>
              Stroke Chronicity Stage <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/lesion`}>
              Lesion Mapping <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Motor Deficit Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Paretic Upper Limb Laterality</FormLabel>
                <Select value={pareticSide} onChange={e => setPareticSide(e.target.value)}>
                  <option>Right Hemiparesis (Left Hemisphere Infarct)</option>
                  <option>Left Hemiparesis (Right Hemisphere Infarct)</option>
                  <option>Bilateral / Brainstem Infarct Quadriparesis</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Fugl-Meyer Assessment Upper Extremity (FMA-UE): <strong>{fmaScore} / 66</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={66}
                  value={fmaScore}
                  onChange={e => setFmaScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>0 (Severe Plega)</span>
                  <span>33 (Moderate)</span>
                  <span>66 (Normal Function)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>Modified Ashworth Scale (MAS) Spasticity</FormLabel>
                <Select value={ashworthScale} onChange={e => setAshworthScale(e.target.value)}>
                  <option>0 (No increase in tone)</option>
                  <option>1 (Slight increase in tone, minimal catch)</option>
                  <option>1+ (Slight increase in tone, catch and release)</option>
                  <option>2 (More marked increase, affected part easily flexed)</option>
                  <option>3 (Considerable increase in tone, passive movement difficult)</option>
                  <option>4 (Rigid in flexion or extension)</option>
                </Select>
              </FormGroup>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="finger-ext"
                  checked={hasFingerExtension}
                  onChange={e => setHasFingerExtension(e.target.checked)}
                />
                <label htmlFor="finger-ext" className="text-sm text-primary cursor-pointer">
                  Residual voluntary active finger extension present (&gt; 10° at MCP/IP joints)
                </label>
              </div>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Impairment Profile
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Impairment profile
                  confirmed
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Corticospinal Tract & Neuroplastic Invariants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm text-secondary">
              <p className="m-0">
                Under <strong>IMR-STROKE-2.0.0</strong>, neuromodulation targeting stratifies based
                on the presence of residual motor potential:
              </p>
              <div className="panel-dark">
                <strong className="text-primary block mb-1">
                  Ipsilesional Facilitation (FMA &gt; 20):
                </strong>
                <span>
                  High-frequency rTMS (10–20 Hz) or iTBS applied to the ipsilesional motor cortex
                  (M1 / premotor) to upregulate perilesional excitability.
                </span>
              </div>
              <div className="panel-dark">
                <strong className="text-primary block mb-1">
                  Contralesional Inhibition (FMA ≤ 20):
                </strong>
                <span>
                  Low-frequency rTMS (1 Hz) or cTBS to the contralesional M1 to suppress maladaptive
                  interhemispheric inhibition.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
