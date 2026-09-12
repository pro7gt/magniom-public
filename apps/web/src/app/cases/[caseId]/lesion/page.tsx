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
  Alert,
  Checkbox,
  Select,
  RangeSlider,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function LesionContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [hasLesion, setHasLesion] = useState(true);
  const [lesionType, setLesionType] = useState('Ischemic Infarct (Left MCA Superior Division)');
  const [skullAbnormality, setSkullAbnormality] = useState(false);
  const [clearanceMm, setClearanceMm] = useState(18.5);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const r = caseStore.getCaseRecord(caseId);
    setRecord(r);
    if (r?.lesionContext) {
      setHasLesion(r.lesionContext.hasLesion);
      if (r.lesionContext.lesionType) setLesionType(r.lesionContext.lesionType);
      setSkullAbnormality(r.lesionContext.skullAbnormalityPresent);
    }
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        const updated = caseStore.getCaseRecord(caseId);
        setRecord(updated);
        if (updated?.lesionContext) {
          setHasLesion(updated.lesionContext.hasLesion);
          if (updated.lesionContext.lesionType) setLesionType(updated.lesionContext.lesionType);
          setSkullAbnormality(updated.lesionContext.skullAbnormalityPresent);
        }
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

  const isGateG3Passed = !skullAbnormality && clearanceMm >= 15.0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    caseStore.updateLesionContext(caseId, {
      hasLesion,
      lesionType,
      laterality: 'Left Hemisphere',
      interpretation: 'Stable mature cavitation with gliotic margin. No mass effect.',
      affectedRegionsCount: 3,
      hasTargetOverlapWarning: clearanceMm < 15.0,
      skullAbnormalityPresent: skullAbnormality,
    });
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Lesion Context Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Structural Lesion Context', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Structural Lesion Context & Boundary Exclusions"
        subtitle="Hard Gate G3 Structural Exclusions & Skull Breach Safety Invariants (§54, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/measurements/lesion-mask`}>
              Lesion Mask Details <ArrowRightIcon size={14} className="ml-1 inline" />
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
            <CardTitle as="h2" className="text-cyan">
              Lesion Segmentation & Safety Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has-lesion"
                  checked={hasLesion}
                  onChange={e => setHasLesion(e.target.checked)}
                />
                <label
                  htmlFor="has-lesion"
                  className="text-sm font-semibold text-primary cursor-pointer"
                >
                  Structural Parenchymal Lesion Present
                </label>
              </div>

              {hasLesion && (
                <>
                  <FormGroup>
                    <FormLabel>Lesion Etiology & Territory</FormLabel>
                    <Select value={lesionType} onChange={e => setLesionType(e.target.value)}>
                      <option>Ischemic Infarct (Left MCA Superior Division)</option>
                      <option>Ischemic Infarct (Right MCA Deep Territory)</option>
                      <option>Intracerebral Hemorrhage (Basal Ganglia Resorbed)</option>
                      <option>Traumatic Cortical Contusion (Frontal Pole)</option>
                      <option>Arteriovenous Malformation Treated (Stable)</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>
                      Target-to-Lesion Clearance Distance: <strong>{clearanceMm} mm</strong>
                    </FormLabel>
                    <RangeSlider
                      min={5}
                      max={40}
                      step={0.5}
                      value={clearanceMm}
                      onChange={e => setClearanceMm(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-muted">
                      <span>5 mm (DANGER)</span>
                      <span>15 mm (Minimum Threshold)</span>
                      <span>40 mm (Generous)</span>
                    </div>
                  </FormGroup>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="skull-defect"
                      checked={skullAbnormality}
                      onChange={e => setSkullAbnormality(e.target.checked)}
                    />
                    <label
                      htmlFor="skull-defect"
                      className={`text-sm cursor-pointer ${skullAbnormality ? 'text-rose' : 'text-primary'}`}
                    >
                      Skull breach, decompressive hemicraniectomy, or burr hole present
                    </label>
                  </div>
                </>
              )}

              <Alert
                variant={isGateG3Passed ? 'success' : 'danger'}
                title={
                  isGateG3Passed
                    ? 'Gate G3 Passed: Structural Safety Cleared'
                    : 'Gate G3 Block: Safety Violation'
                }
                description={
                  isGateG3Passed
                    ? `Clearance of ${clearanceMm} mm exceeds 15.0 mm safety margin with intact cranium.`
                    : skullAbnormality
                      ? 'CRANIAL BREACH DETECTED: TMS across a cranial defect induces severe current distortion and is strictly contraindicated.'
                      : 'INSUFFICIENT CLEARANCE: Candidate stimulation cone encroaches directly on encephalomalacic cavity.'
                }
              />

              <Button variant="primary" type="submit" className="self-start">
                Confirm Lesion Boundaries
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Lesion context
                  updated
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Lesion Exclusion Rules (ISO 14971)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="rule-list">
              <li className="panel-subtle">
                <strong className="text-primary block">Zero Direct Cavity Stimulation:</strong>
                Necrotic core tissue contains no viable neurons; direct stimulation wastes coil
                energy and can cause erratic current channeling.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Perilesional Penumbra Target:</strong>
                Stimulation is prioritized to the intact functionally connected margin immediately
                surrounding the lesion boundary.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Skull Defect Shunting:</strong>
                Bone defects alter regional impedance by up to 10×, concentrating electric fields to
                seizure-inducing intensities.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
