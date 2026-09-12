'use client';

import {
  CheckIcon,
  Breadcrumbs,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
  Alert,
  Input,
  FormLabel,
} from '@/components/ui';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { caseStore } from '../../../lib/case-store';
import { getModuleUiDescriptor } from '@magniom/presentation';

type WizardStep = 'patient' | 'indication' | 'module_review' | 'confirm';

const SUPPORTED_INDICATIONS = [
  { code: 'MDD', label: 'Major Depressive Disorder ± Anxious Distress', supported: true },
  { code: 'PAIN', label: 'Intractable Neuropathic Pain', supported: true },
  { code: 'STROKE_MOTOR', label: 'Post-Stroke Motor Recovery', supported: true },
  { code: 'STROKE_APHASIA', label: 'Post-Stroke Expressive Aphasia', supported: true },
  { code: 'OCD', label: 'Obsessive-Compulsive Disorder (Deep TMS)', supported: true },
  { code: 'TINNITUS', label: 'Subjective Refractory Tinnitus', supported: false },
  { code: 'TBI', label: 'Chronic Traumatic Brain Injury', supported: false },
  { code: 'SUD', label: 'Substance Use Disorders', supported: false },
];

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('patient');
  const [patientId, setPatientId] = useState('');
  const [selectedIndication, setSelectedIndication] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedIndicationData = SUPPORTED_INDICATIONS.find(i => i.code === selectedIndication);
  const descriptor = selectedIndication ? getModuleUiDescriptor(selectedIndication) : null;

  const handleConfirmCreate = () => {
    if (!patientId || !selectedIndication) {
      setError('Patient ID and Indication are required.');
      return;
    }

    try {
      const newCaseId = caseStore.createCase({
        patientId: patientId.trim(),
        indicationCode: selectedIndication,
      });
      router.push(`/cases/${newCaseId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create case.');
    }
  };

  const stepLabels: Record<WizardStep, string> = {
    patient: '1. Patient Identification',
    indication: '2. Select Indication',
    module_review: '3. Module Review',
    confirm: '4. Confirm & Create',
  };

  return (
    <div className="container page-container-col p-6 max-w-2xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cases', href: '/cases' },
          { label: 'New Clinical Case', current: true },
        ]}
      />

      {/* Wizard Header (§152) */}
      <PageHeader
        title="Create New Clinical Case"
        subtitle="Each case represents a single patient's TMS targeting workflow for one or more clinical indications."
      />

      {/* Step Indicator (§154) */}
      <nav className="wizard-step-indicator flex gap-1 mb-6" aria-label="Case creation progress">
        {(Object.keys(stepLabels) as WizardStep[]).map((s, idx) => {
          const isCurrent = s === step;
          const steps = Object.keys(stepLabels) as WizardStep[];
          const isComplete = steps.indexOf(s) < steps.indexOf(step);
          const pillClass =
            `wizard-step-pill ${isCurrent ? 'current' : ''} ${isComplete ? 'complete' : ''}`.trim();
          return (
            <React.Fragment key={s}>
              <span className={pillClass}>
                {isComplete ? <CheckIcon size={12} className="mr-1 inline text-emerald" /> : ''}{' '}
                {stepLabels[s]}
              </span>
              {idx < Object.keys(stepLabels).length - 1 && (
                <span className="text-muted">
                  <ArrowRightIcon size={12} />
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Step 1: Patient (§155) */}
      {step === 'patient' && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Patient Identification
            </CardTitle>
            <CardDescription>
              Enter the de-identified patient token or clinical study ID. Patient identifiers are
              never stored alongside neuroimaging or targeting data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormLabel htmlFor="patient-id-input">Patient Identifier</FormLabel>
            <Input
              id="patient-id-input"
              type="text"
              value={patientId}
              onChange={e => {
                setPatientId(e.target.value);
                setError(null);
              }}
              placeholder="e.g. PT-2026-0042 or SUBJ-MDD-0012"
              className="font-mono"
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="primary"
              onClick={() => {
                if (!patientId.trim()) {
                  setError('Patient identifier is required.');
                  return;
                }
                setError(null);
                setStep('indication');
              }}
            >
              Next: Select Indication <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Indication Selection (§156) */}
      {step === 'indication' && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Select Primary Indication
            </CardTitle>
            <CardDescription>
              Each indication loads an independent targeting module with its own context
              requirements, measurement modalities, evidence library, and decision pathway.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {SUPPORTED_INDICATIONS.map(ind => (
                <Button
                  variant="ghost"
                  key={ind.code}
                  onClick={() => {
                    if (!ind.supported) {
                      setError(
                        `${ind.label} is an experimental Research-only indication. Clinical case creation is not permitted. Use Research Mode for hypothesis exploration.`,
                      );
                      return;
                    }
                    setError(null);
                    setSelectedIndication(ind.code);
                  }}
                  className={`justify-between p-3.5 border ${selectedIndication === ind.code ? 'border-cyan bg-cyan/5' : 'border-subtle'}`}
                >
                  <div>
                    <strong>{ind.label}</strong>
                    <span className="block text-xs text-muted font-mono mt-0.5">{ind.code}</span>
                  </div>
                  {!ind.supported && (
                    <Badge variant="tierexp" className="text-xs">
                      Research Only
                    </Badge>
                  )}
                  {ind.supported && selectedIndication === ind.code && (
                    <CheckIcon size={14} className="text-cyan inline" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="secondary" onClick={() => setStep('patient')}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Back
            </Button>
            <Button
              variant="primary"
              disabled={!selectedIndication}
              onClick={() => {
                if (!selectedIndication) {
                  setError('Please select a clinical indication.');
                  return;
                }
                setError(null);
                setStep('module_review');
              }}
            >
              Next: Review Module <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Module Review (§157) */}
      {step === 'module_review' && descriptor && selectedIndicationData && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Module Configuration Review
            </CardTitle>
            <CardDescription>
              The following indication module will govern this case&apos;s targeting workflow.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-surface-card rounded border border-subtle">
                <strong className="text-primary">{descriptor.indication_name}</strong>
                <span className="block text-xs text-muted font-mono mt-1">
                  {descriptor.indication_module_release_id}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">
                  Required Context Sections
                </h3>
                <ul className="pl-5 text-secondary text-sm m-0">
                  {descriptor.context_sections.map(cs => (
                    <li key={cs.id}>
                      {cs.label} {cs.required ? '(Required)' : '(Optional)'}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">
                  Required Measurement Modalities
                </h3>
                <ul className="pl-5 text-secondary text-sm m-0">
                  {descriptor.measurement_sections.map(ms => (
                    <li key={ms.modality}>
                      {ms.label} {ms.required ? '(Required)' : '(Optional)'}
                      {ms.fallbackAllowed && ' — Fallback allowed'}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Target Geometry Types</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {descriptor.target_geometry_renderers.map(g => (
                    <Badge variant="neutral" key={g} className="text-xs">
                      {g.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-between">
            <Button variant="secondary" onClick={() => setStep('indication')}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Back
            </Button>
            <Button variant="primary" onClick={() => setStep('confirm')}>
              Next: Confirm <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Confirmation (§158) */}
      {step === 'confirm' && selectedIndicationData && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Confirm Case Creation
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between py-2 border-b-subtle">
                <span className="text-secondary">Patient ID</span>
                <strong className="text-primary font-mono">{patientId}</strong>
              </div>
              <div className="flex justify-between py-2 border-b-subtle">
                <span className="text-secondary">Primary Indication</span>
                <strong className="text-primary">{selectedIndicationData.label}</strong>
              </div>
              <div className="flex justify-between py-2 border-b-subtle">
                <span className="text-secondary">Module Release</span>
                <strong className="text-primary font-mono">
                  {descriptor?.indication_module_release_id || 'N/A'}
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary">Mode</span>
                <strong className="text-primary">CLINICAL</strong>
              </div>
            </div>

            <Alert variant="info" title="Note:">
              Creating this case will establish an independent targeting workflow governed by the
              selected indication module. The case will begin in Draft status.
            </Alert>
          </CardContent>

          <CardFooter className="justify-between">
            <Button variant="secondary" onClick={() => setStep('module_review')}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Back
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmCreate}
              id="confirm-create-case-btn"
              className="font-bold"
            >
              Create Case <CheckIcon size={14} className="ml-1 inline" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
