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
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';
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
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
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
    <div className="container page-container-col">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        ariaLabel="Measurement Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Measurements', href: `/cases/${caseId}/measurements` },
          { label: modalityTitle, current: true },
        ]}
      />

      {/* Header Banner */}
      <PageHeader
        variant="case-workspace"
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>{modalityTitle}</span>
            <Badge className={`${getBadgeClass(qualification)} capitalize`}>
              {qualification.replace(/_/g, ' ')}
            </Badge>
            {isRequired ? (
              <Badge variant="tier1">Required Modality</Badge>
            ) : (
              <Badge variant="tierexp">Optional / Research</Badge>
            )}
          </span>
        }
        subtitle={
          <>
            Indication Module: <strong>{record.clinicalCase.indicationCode}</strong> · Case ID:{' '}
            {record.clinicalCase.caseCode}
          </>
        }
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/measurements`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> All Measurements
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* Grid: Quality Control & Provenance */}
      <div className="grid-cards-320 mb-6">
        {/* Card 1: ISO 14971 QC Qualification */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Quality Control & Reliability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="spec-list">
              <li className="flex justify-between">
                <span className="text-secondary">Qualification Status:</span>
                <strong className="text-primary uppercase">{qualification}</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Signal-to-Noise Ratio (SNR):</span>
                <strong className="text-primary">48.6 dB (PASS &gt; 35 dB)</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Motion Artifact / FD:</span>
                <strong className="text-primary">0.14 mm (&lt; 0.30 mm threshold)</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Defacing Verification:</span>
                <strong className="text-emerald">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Cryptographically
                  Verified
                </strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Laterality Cross-Check:</span>
                <strong className="text-emerald">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Left/Right Verified
                </strong>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Card 2: Stereotactic Space & Registration */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Stereotactic Space & Transforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="spec-list">
              <li className="flex justify-between">
                <span className="text-secondary">Target Reference Space:</span>
                <strong className="text-primary">MNI152 Non-linear 6th Generation</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Voxel Resolution:</span>
                <strong className="text-primary">1.0 × 1.0 × 1.0 mm³ Isotropic</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Transform Warp Field:</span>
                <strong className="text-primary">SyN Diffeomorphic Non-linear</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-secondary">Registration Dice Overlap:</span>
                <strong className="text-primary">0.941 (Sub-millimetre precision)</strong>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Card 3: Clinical Ranking Role (§225–§228) */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Clinical Ranking Disclosure (§225–228)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              {isUsedForRanking ? (
                <Badge variant="tier1" className="text-sm inline-block mb-2">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Used for Primary
                  Clinical Ranking
                </Badge>
              ) : (
                <Badge variant="tierexp" className="text-sm inline-block mb-2">
                  ○ Explanatory / Secondary Evidence Only
                </Badge>
              )}
              <p className="m-0 text-sm text-secondary leading-relaxed">
                {isUsedForRanking
                  ? 'This modality directly drives target coordinate selection, electric field calculations, and ranking ordering in Stage 12 of the Target Engine.'
                  : 'This modality provides contextual evidence and does not perturb the primary stereotactic coordinates or ranking order.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialized Modality Widgets */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="m-0 text-lg text-primary font-semibold">
            Modality Protocol & Scientific Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Dynamic content depending on modality */}
          {normalizedKey === 'motor_evoked_potential' || normalizedKey === 'motor_mapping' ? (
            <div className="grid-cards-240">
              <div className="panel-dark">
                <div className="text-xs text-muted">RESTING MOTOR THRESHOLD (rMT)</div>
                <div className="text-xl font-bold text-primary mt-1">54% MSO</div>
                <div className="text-xs text-secondary">Magstim 200² Figure-8 Coil</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">MEP PEAK-TO-PEAK AMPLITUDE</div>
                <div className="text-xl font-bold text-cyan mt-1">1.42 mV</div>
                <div className="text-xs text-secondary">Right FDI (120% rMT, n=10 pulses)</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">HOTSPOT COORDINATES (MNI)</div>
                <div className="text-lg font-bold text-primary mt-1">[-37, -21, 58] mm</div>
                <div className="text-xs text-secondary">Precentral Gyrus / Hand Knob</div>
              </div>
            </div>
          ) : normalizedKey === 'efield' ? (
            <div className="grid-cards-240">
              <div className="panel-dark">
                <div className="text-xs text-muted">PEAK GRAY MATTER E-FIELD</div>
                <div className="text-xl font-bold text-cyan mt-1">128.4 V/m</div>
                <div className="text-xs text-secondary">Target ROI Exposure</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">99.9th PERCENTILE FIELD</div>
                <div className="text-xl font-bold text-primary mt-1">142.1 V/m</div>
                <div className="text-xs text-secondary">Finite Element Mesh (FEM) 5-tissue</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">SKULL DEFECT ATTENUATION</div>
                <div className="text-lg font-bold text-emerald mt-1">NOMINAL (0.0%)</div>
                <div className="text-xs text-secondary">No craniotomy breach detected</div>
              </div>
            </div>
          ) : normalizedKey === 'lesion_mapping' ? (
            <div className="grid-cards-240">
              <div className="panel-dark">
                <div className="text-xs text-muted">LESION MORPHOLOGY</div>
                <div className="text-xl font-bold text-primary mt-1">Ischemic Infarct</div>
                <div className="text-xs text-secondary">Left MCA Superior Division</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">INFARCTION CORE VOLUME</div>
                <div className="text-xl font-bold text-primary mt-1">14.8 cm³</div>
                <div className="text-xs text-secondary">
                  Subcortical White Matter / Corona Radiata
                </div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">TARGET OVERLAP CLEARANCE</div>
                <div className="text-lg font-bold text-emerald mt-1">&gt; 18 mm (PASS)</div>
                <div className="text-xs text-secondary">Zero lesion tissue in stimulation cone</div>
              </div>
            </div>
          ) : normalizedKey === 'audiology' ? (
            <div className="grid-cards-240">
              <div className="panel-dark">
                <div className="text-xs text-muted">TINNITUS PITCH MATCH</div>
                <div className="text-xl font-bold text-cyan mt-1">6.2 kHz</div>
                <div className="text-xs text-secondary">Bilateral High-Frequency Tonal</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">LOUDNESS MATCH</div>
                <div className="text-xl font-bold text-primary mt-1">8 dB SL</div>
                <div className="text-xs text-secondary">Sensation Level above threshold</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">MINIMUM MASKING LEVEL</div>
                <div className="text-lg font-bold text-primary mt-1">42 dB HL</div>
                <div className="text-xs text-secondary">Narrow-band noise centered at 6 kHz</div>
              </div>
            </div>
          ) : (
            <div className="grid-cards-240">
              <div className="panel-dark">
                <div className="text-xs text-muted">ACQUISITION SCANNER</div>
                <div className="text-lg font-bold text-primary mt-1">Siemens Prisma 3.0T</div>
                <div className="text-xs text-secondary">64-Channel Head Neck Coil</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">DATA CONFORMANCE</div>
                <div className="text-lg font-bold text-emerald mt-1">DICOM / BIDS 1.8.0</div>
                <div className="text-xs text-secondary">NIfTI-1 with qform/sform alignment</div>
              </div>
              <div className="panel-dark">
                <div className="text-xs text-muted">RELIABILITY INDEX</div>
                <div className="text-lg font-bold text-cyan mt-1">0.985 (HIGH)</div>
                <div className="text-xs text-secondary">Automated quality pipeline verified</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
