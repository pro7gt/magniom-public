'use client';

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
    <div
      className="new-case-wizard"
      style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}
    >
      {/* Wizard Header (§152) */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 700 }}>
          Create New Clinical Case
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Each case represents a single patient&apos;s TMS targeting workflow for one or more
          clinical indications.
        </p>
      </header>

      {/* Step Indicator (§154) */}
      <nav
        className="wizard-step-indicator"
        aria-label="Case creation progress"
        style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}
      >
        {(Object.keys(stepLabels) as WizardStep[]).map((s, idx) => {
          const isCurrent = s === step;
          const steps = Object.keys(stepLabels) as WizardStep[];
          const isComplete = steps.indexOf(s) < steps.indexOf(step);
          return (
            <React.Fragment key={s}>
              <span
                style={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: isCurrent ? 600 : 400,
                  backgroundColor: isCurrent
                    ? 'rgba(59,130,246,0.2)'
                    : isComplete
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(255,255,255,0.04)',
                  color: isCurrent ? '#60a5fa' : isComplete ? '#10b981' : 'var(--text-muted)',
                  border: `1px solid ${isCurrent ? '#3b82f6' : isComplete ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {isComplete ? '✓' : ''} {stepLabels[s]}
              </span>
              {idx < Object.keys(stepLabels).length - 1 && (
                <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Error Display */}
      {error && (
        <aside
          role="alert"
          style={{
            backgroundColor: '#4a1114',
            color: '#ffdddd',
            border: '1px solid #e53e3e',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </aside>
      )}

      {/* Step 1: Patient (§155) */}
      {step === 'patient' && (
        <section
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
            Patient Identification
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Enter the de-identified patient token or clinical study ID. Patient identifiers are
            never stored alongside neuroimaging or targeting data.
          </p>
          <label
            htmlFor="patient-id-input"
            style={{
              display: 'block',
              marginBottom: '6px',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Patient Identifier
          </label>
          <input
            id="patient-id-input"
            type="text"
            value={patientId}
            onChange={e => {
              setPatientId(e.target.value);
              setError(null);
            }}
            placeholder="e.g. PT-2026-0042 or SUBJ-MDD-0012"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              onClick={() => {
                if (!patientId.trim()) {
                  setError('Patient identifier is required.');
                  return;
                }
                setError(null);
                setStep('indication');
              }}
              style={{
                padding: '10px 24px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Next: Select Indication →
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Indication Selection (§156) */}
      {step === 'indication' && (
        <section
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
            Select Primary Indication
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Each indication loads an independent targeting module with its own context requirements,
            measurement modalities, evidence library, and decision pathway.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SUPPORTED_INDICATIONS.map(ind => (
              <button
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
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderRadius: '6px',
                  border: `1px solid ${selectedIndication === ind.code ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor:
                    selectedIndication === ind.code
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(255,255,255,0.02)',
                  color: 'var(--text-main)',
                  cursor: ind.supported ? 'pointer' : 'not-allowed',
                  opacity: ind.supported ? 1 : 0.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{ind.label}</strong>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '2px',
                    }}
                  >
                    {ind.code}
                  </span>
                </div>
                {!ind.supported && (
                  <span className="badge badge-tierexp" style={{ fontSize: '0.75rem' }}>
                    Research Only
                  </span>
                )}
                {ind.supported && selectedIndication === ind.code && (
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>✓</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button
              onClick={() => setStep('patient')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (!selectedIndication) {
                  setError('Please select a clinical indication.');
                  return;
                }
                setError(null);
                setStep('module_review');
              }}
              disabled={!selectedIndication}
              style={{
                padding: '10px 24px',
                backgroundColor: selectedIndication ? '#2563eb' : '#1f2937',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedIndication ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              Next: Review Module →
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Module Review (§157) */}
      {step === 'module_review' && descriptor && selectedIndicationData && (
        <section
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
            Module Configuration Review
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            The following indication module will govern this case&apos;s targeting workflow.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <strong style={{ color: 'var(--text-main)' }}>{descriptor.indication_name}</strong>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px',
                }}
              >
                {descriptor.indication_module_release_id}
              </span>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Required Context Sections
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                }}
              >
                {descriptor.context_sections.map(cs => (
                  <li key={cs.id}>
                    {cs.label} {cs.required ? '(Required)' : '(Optional)'}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Required Measurement Modalities
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                }}
              >
                {descriptor.measurement_sections.map(ms => (
                  <li key={ms.modality}>
                    {ms.label} {ms.required ? '(Required)' : '(Optional)'}
                    {ms.fallbackAllowed && ' — Fallback allowed'}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Target Geometry Types
              </h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {descriptor.target_geometry_renderers.map(g => (
                  <span key={g} className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                    {g.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button
              onClick={() => setStep('indication')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep('confirm')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Next: Confirm →
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Confirmation (§158) */}
      {step === 'confirm' && selectedIndicationData && (
        <section
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
            Confirm Case Creation
          </h2>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Patient ID</span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {patientId}
              </strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Primary Indication</span>
              <strong style={{ color: 'var(--text-main)' }}>{selectedIndicationData.label}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Module Release</span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {descriptor?.indication_module_release_id || 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mode</span>
              <strong style={{ color: 'var(--text-main)' }}>CLINICAL</strong>
            </div>
          </div>

          <aside
            role="note"
            style={{
              backgroundColor: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: '#93c5fd',
              marginBottom: '20px',
            }}
          >
            <strong>Note:</strong> Creating this case will establish an independent targeting
            workflow governed by the selected indication module. The case will begin in Draft
            status.
          </aside>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep('module_review')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleConfirmCreate}
              id="confirm-create-case-btn"
              style={{
                padding: '12px 28px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              Create Case ✓
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
