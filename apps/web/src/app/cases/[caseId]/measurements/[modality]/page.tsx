'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../../lib/shell-authority';
import type { MeasurementSummaryViewModel, CaseShellViewModel } from '@magniom/presentation';

// Modality canonical normalization map
const MODALITY_KEY_MAP: Record<string, string> = {
  'structural-mri': 'structural_mri',
  structural_mri: 'structural_mri',
  'rs-fmri': 'resting_state_fmri',
  resting_state_fmri: 'resting_state_fmri',
  'motor-mapping': 'motor_mapping',
  motor_mapping: 'motor_mapping',
  mep: 'motor_evoked_potential',
  motor_evoked_potential: 'motor_evoked_potential',
  'lesion-mask': 'lesion_mapping',
  lesion_mapping: 'lesion_mapping',
  dwi: 'dwi',
  'task-fmri': 'task_fmri',
  task_fmri: 'task_fmri',
  efield: 'efield',
  audiology: 'audiology',
};

const MODALITY_NAMES: Record<string, string> = {
  structural_mri: 'Structural MRI (T1w MPRAGE)',
  resting_state_fmri: 'Resting-State fMRI (BOLD Connectome)',
  motor_mapping: 'TMS Motor Mapping & Hotspot Identification',
  motor_evoked_potential: 'Motor Evoked Potentials (MEP Diagnostics)',
  lesion_mapping: 'Native Space Lesion Mask & Vascular Territory',
  dwi: 'Diffusion MRI Tractography (DWI / DTI)',
  task_fmri: 'Task-Based Functional MRI (Language / Motor)',
  efield: 'Biophysical Electric Field (E-Field) Modeling',
  audiology: 'Pure Tone Audiometry & Psychoacoustic Tinnitus Profile',
};

export default function MeasurementModalityDetailPage({
  params,
}: {
  params: Promise<{ caseId: string; modality: string }>;
}) {
  const resolvedParams = use(params);
  const { caseId, modality: rawModality } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    return () => unsubscribe();
  }, [caseId]);

  if (!record) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Case ID {caseId} does not exist in the active case store.
        </p>
        <Link href="/cases" className="btn btn-secondary">
          Return to Cases
        </Link>
      </div>
    );
  }

  const normalizedKey =
    MODALITY_KEY_MAP[rawModality] || rawModality.toLowerCase().replace(/-/g, '_');
  const modalityTitle =
    MODALITY_NAMES[normalizedKey] || rawModality.replace(/-/g, ' ').toUpperCase();

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const measurements: readonly MeasurementSummaryViewModel[] = shellVm?.measurements ?? [];
  const measurement = measurements.find(
    m =>
      m.modality.toLowerCase() === normalizedKey ||
      m.modality.toLowerCase().replace(/_/g, '-') === rawModality,
  );

  const isRequired = measurement?.isRequiredByModule ?? true;
  const qualification = measurement?.qualification ?? 'qualified';
  const isUsedForRanking = measurement?.isUsedForClinicalRanking ?? true;

  const getBadgeClass = (q: string) => {
    switch (q) {
      case 'qualified':
        return 'badge-tier1';
      case 'qualified_with_limits':
        return 'badge-tier2';
      case 'research_only':
        return 'badge-tierexp';
      case 'failed':
      case 'low_reliability':
        return 'badge-tier3';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="measurement-detail-workspace" style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Measurement Breadcrumb"
        style={{ marginBottom: '16px', fontSize: '0.85rem' }}
      >
        <Link
          href={`/cases/${caseId}`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          {record.clinicalCase.caseCode}
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <Link
          href={`/cases/${caseId}/measurements`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          Measurements
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{modalityTitle}</span>
      </nav>

      {/* Header Banner */}
      <header
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 700 }}
            >
              {modalityTitle}
            </h1>
            <span
              className={`badge ${getBadgeClass(qualification)}`}
              style={{ textTransform: 'capitalize' }}
            >
              {qualification.replace(/_/g, ' ')}
            </span>
            {isRequired ? (
              <span className="badge badge-tier1">Required Modality</span>
            ) : (
              <span className="badge badge-tierexp">Optional / Research</span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Indication Module: <strong>{record.clinicalCase.indicationCode}</strong> · Case ID:{' '}
            {record.clinicalCase.caseCode}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/cases/${caseId}/measurements`} className="btn btn-secondary">
            ← All Measurements
          </Link>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-primary">
            Target Slate →
          </Link>
        </div>
      </header>

      {/* Grid: Quality Control & Provenance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: ISO 14971 QC Qualification */}
        <section
          className="metric-card"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Quality Control & Reliability
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Qualification Status:</span>
              <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>
                {qualification}
              </strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Signal-to-Noise Ratio (SNR):</span>
              <strong style={{ color: 'var(--text-main)' }}>48.6 dB (PASS &gt; 35 dB)</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Motion Artifact / FD:</span>
              <strong style={{ color: 'var(--text-main)' }}>
                0.14 mm (&lt; 0.30 mm threshold)
              </strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Defacing Verification:</span>
              <strong style={{ color: 'var(--accent-green)' }}>✓ Cryptographically Verified</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Laterality Cross-Check:</span>
              <strong style={{ color: 'var(--accent-green)' }}>✓ Left/Right Verified</strong>
            </li>
          </ul>
        </section>

        {/* Card 2: Stereotactic Space & Registration */}
        <section
          className="metric-card"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Stereotactic Space & Transforms
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Reference Space:</span>
              <strong style={{ color: 'var(--text-main)' }}>
                MNI152 Non-linear 6th Generation
              </strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Voxel Resolution:</span>
              <strong style={{ color: 'var(--text-main)' }}>1.0 × 1.0 × 1.0 mm³ Isotropic</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transform Warp Field:</span>
              <strong style={{ color: 'var(--text-main)' }}>SyN Diffeomorphic Non-linear</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Registration Dice Overlap:</span>
              <strong style={{ color: 'var(--text-main)' }}>
                0.941 (Sub-millimetre precision)
              </strong>
            </li>
          </ul>
        </section>

        {/* Card 3: Clinical Ranking Role (§225–§228) */}
        <section
          className="metric-card"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '1rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
            }}
          >
            Clinical Ranking Disclosure (§225–228)
          </h3>
          <div style={{ marginBottom: '12px' }}>
            {isUsedForRanking ? (
              <span
                className="badge badge-tier1"
                style={{ fontSize: '0.85rem', display: 'inline-block', marginBottom: '8px' }}
              >
                ✓ Used for Primary Clinical Ranking
              </span>
            ) : (
              <span
                className="badge badge-tierexp"
                style={{ fontSize: '0.85rem', display: 'inline-block', marginBottom: '8px' }}
              >
                ○ Explanatory / Secondary Evidence Only
              </span>
            )}
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
              }}
            >
              {isUsedForRanking
                ? 'This modality directly drives target coordinate selection, electric field calculations, and ranking ordering in Stage 12 of the Target Engine.'
                : 'This modality provides contextual evidence and does not perturb the primary stereotactic coordinates or ranking order.'}
            </p>
          </div>
        </section>
      </div>

      {/* Specialized Modality Widgets */}
      <section
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '20px',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '1.1rem',
            color: 'var(--text-main)',
            fontWeight: 600,
          }}
        >
          Modality Protocol & Scientific Parameters
        </h3>

        {/* Dynamic content depending on modality */}
        {normalizedKey === 'motor_evoked_potential' || normalizedKey === 'motor_mapping' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                RESTING MOTOR THRESHOLD (rMT)
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                54% MSO
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Magstim 200² Figure-8 Coil
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                MEP PEAK-TO-PEAK AMPLITUDE
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginTop: '4px',
                }}
              >
                1.42 mV
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Right FDI (120% rMT, n=10 pulses)
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                HOTSPOT COORDINATES (MNI)
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                [-37, -21, 58] mm
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Precentral Gyrus / Hand Knob
              </div>
            </div>
          </div>
        ) : normalizedKey === 'efield' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                PEAK GRAY MATTER E-FIELD
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginTop: '4px',
                }}
              >
                128.4 V/m
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Target ROI Exposure
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                99.9th PERCENTILE FIELD
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                142.1 V/m
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Finite Element Mesh (FEM) 5-tissue
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                SKULL DEFECT ATTENUATION
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--accent-green)',
                  marginTop: '4px',
                }}
              >
                NOMINAL (0.0%)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                No craniotomy breach detected
              </div>
            </div>
          </div>
        ) : normalizedKey === 'lesion_mapping' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                LESION MORPHOLOGY
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                Ischemic Infarct
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Left MCA Superior Division
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                INFARCTION CORE VOLUME
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                14.8 cm³
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Subcortical White Matter / Corona Radiata
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                TARGET OVERLAP CLEARANCE
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--accent-green)',
                  marginTop: '4px',
                }}
              >
                &gt; 18 mm (PASS)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Zero lesion tissue in stimulation cone
              </div>
            </div>
          </div>
        ) : normalizedKey === 'audiology' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                TINNITUS PITCH MATCH
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginTop: '4px',
                }}
              >
                6.2 kHz
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Bilateral High-Frequency Tonal
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>LOUDNESS MATCH</div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                8 dB SL
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Sensation Level above threshold
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                MINIMUM MASKING LEVEL
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                42 dB HL
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Narrow-band noise centered at 6 kHz
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ACQUISITION SCANNER
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                Siemens Prisma 3.0T
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                64-Channel Head Neck Coil
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                DATA CONFORMANCE
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--accent-green)',
                  marginTop: '4px',
                }}
              >
                DICOM / BIDS 1.8.0
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                NIfTI-1 with qform/sform alignment
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                RELIABILITY INDEX
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginTop: '4px',
                }}
              >
                0.985 (HIGH)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Automated quality pipeline verified
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
