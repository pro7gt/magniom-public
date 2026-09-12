'use client';

import React, { use, useState, useEffect } from 'react';
import {
  CheckIcon,
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
  Select,
  RangeSlider,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function PainContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [vasScore, setVasScore] = useState(8);
  const [painType, setPainType] = useState('Central Post-Stroke Pain (CPSP)');
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
      `Intractable Neuropathic Pain: VAS ${vasScore}/10, Type: ${painType}`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      {/* Breadcrumbs */}
      <Breadcrumbs
        ariaLabel="Pain Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Pain Phenotype & Somatotopy', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        variant="case-workspace"
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Pain Phenotype &amp; Somatotopy</span>
            <Badge variant="tier1">IMR-PAIN-2.0.0</Badge>
            <Badge variant="tier2">Validation Mode</Badge>
          </span>
        }
        subtitle="Intractable Neuropathic Pain Formulation (§53, §93) · Contralateral Motor Cortex Somatotopy Target Rules"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/body-region`}>
              Body Region Mapping <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/measurements/motor-mapping`}>
              TMS Motor Mapping <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* Main Grid */}
      <div className="stat-card-grid">
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Pain Characterisation & Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Primary Neuropathic Pain Etiology</FormLabel>
                <Select value={painType} onChange={e => setPainType(e.target.value)}>
                  <option>Central Post-Stroke Pain (CPSP)</option>
                  <option>Trigeminal Neuropathic Pain</option>
                  <option>Phantom Limb Pain</option>
                  <option>Refractory Radiculopathy</option>
                  <option>Spinal Cord Injury Neuropathic Pain</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Visual Analog Scale (VAS) Baseline: <strong>{vasScore} / 10</strong>
                </FormLabel>
                <RangeSlider
                  min={1}
                  max={10}
                  value={vasScore}
                  onChange={e => setVasScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>1 (Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe / Disabling)</span>
                </div>
              </FormGroup>

              <div className="form-group">
                <label className="form-label">Refractory Pharmacotherapy Verification</label>
                <div className="text-sm text-secondary flex flex-col gap-1">
                  <span>
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> Gabapentinoids
                    (Pregabalin / Gabapentin) failed at therapeutic ceiling
                  </span>
                  <span>
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> SNRIs (Duloxetine)
                    or TCAs (Amitriptyline) failed or not tolerated
                  </span>
                  <span>
                    <CheckIcon size={14} className="text-emerald mr-1 inline" /> Verified
                    Intractable Neuropathic Pain under Gate G1
                  </span>
                </div>
              </div>

              <Button variant="primary" type="submit" className="self-start mt-2">
                Save Phenotype Parameters
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Phenotype snapshot
                  updated
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Hotspot Rules */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading">
              Targeting Invariants &amp; Somatotopy (§53, §106)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm text-secondary">
              <p className="m-0">
                Under the <strong>PAIN Module Release</strong>, high-frequency rTMS (10–20 Hz) is
                targeted to the <strong>primary motor cortex (M1)</strong> somatotopically
                corresponding to the painful body territory, or the{' '}
                <strong>dorsal anterior cingulate cortex (dACC)</strong> for affective pain burden.
              </p>
              <div className="panel-dark">
                <strong className="text-primary block mb-1">
                  Hard Gate G6: Laterality Preservation
                </strong>
                <span>
                  Stimulation must be delivered <strong>contralateral</strong> to the painful limb
                  or hemibody. Any laterality inversion is blocked automatically as an unsafe
                  candidate.
                </span>
              </div>
              <div className="panel-dark">
                <strong className="text-primary block mb-1">Required Modalities</strong>
                <span>
                  TMS Motor Mapping + Motor Evoked Potentials (MEP) are mandatory to qualify the M1
                  cortical representation prior to Target Slate assembly.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
