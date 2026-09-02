/**
 * Neuroimaging Validation Library Fixtures (I01–I10)
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Sections 74–84
 * and MAGNIOM-Technical Architecture v1.0 Section 99
 */

import type { ConnectomeTargetInput, PhenotypeSnapshot } from '@magniom/domain';
import {
  createConnectomeInput,
  createReliabilityProfile,
  createPhenotypeSnapshot,
} from './golden-cases-suite.js';

export const IMAGING_VALIDATION_PHENOTYPE: PhenotypeSnapshot = createPhenotypeSnapshot({
  id: 'snap-imaging-val',
  patientId: 'pat-imaging-val-001',
});

// ==========================================
// I01: Low Motion (Baseline Reproducibility)
// ==========================================
export const I01_LOW_MOTION_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i01-low-motion',
  qcStatus: 'pass',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i01',
      usableRestingStateMinutes: 15.0,
      meanFramewiseDisplacementMm: 0.08,
      censoredVolumeFraction: 0.0,
      splitHalfSpatialDistanceMm: 1.8,
      compositeSpatialDistanceMm: 1.8,
      overallReliabilityScore: 0.94,
      reliabilityClass: 'high',
      isReliableForPersonalisation: true,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I01-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 95.0,
      circuitConcordanceRaw: 0.88,
      circuitConcordancePercentile: 0.88,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.94,
      fitInterpretation: 'Stable candidate in low-motion acquisition.',
    },
  ],
});

// ==========================================
// I02: Moderate Motion (Censoring & Graceful Degradation)
// ==========================================
export const I02_MODERATE_MOTION_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i02-moderate-motion',
  qcStatus: 'conditional',
  retainedMinutes: 9.8,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i02',
      usableRestingStateMinutes: 9.8,
      meanFramewiseDisplacementMm: 0.18,
      censoredVolumeFraction: 0.18,
      splitHalfSpatialDistanceMm: 4.2,
      compositeSpatialDistanceMm: 4.5,
      overallReliabilityScore: 0.74,
      reliabilityClass: 'moderate',
      isReliableForPersonalisation: true,
      warnings: ['MODERATE_MOTION_ARTIFACT'],
      limitingFactors: ['MODERATE_MOTION_ARTIFACT'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I02-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 85.0,
      circuitConcordanceRaw: 0.82,
      circuitConcordancePercentile: 0.82,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.74,
      fitInterpretation: 'Moderate motion dataset with 18% censored volumes.',
    },
  ],
});

// ==========================================
// I03: Motion Failure (Gate Rejection & Abstention)
// ==========================================
export const I03_MOTION_FAILURE_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i03-motion-fail',
  qcStatus: 'fail',
  retainedMinutes: 6.2,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i03',
      usableRestingStateMinutes: 6.2,
      meanFramewiseDisplacementMm: 0.42,
      censoredVolumeFraction: 0.45,
      compositeSpatialDistanceMm: 12.4,
      overallReliabilityScore: 0.35,
      reliabilityClass: 'unreliable',
      isReliableForPersonalisation: false,
      warnings: ['EXCESSIVE_MOTION_FD_EXCEEDED', 'INSUFFICIENT_RETAINED_DURATION'],
      limitingFactors: ['EXCESSIVE_MOTION_FD_EXCEEDED'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I03-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 50.0,
      circuitConcordanceRaw: 0.8,
      circuitConcordancePercentile: 0.8,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.35,
      fitInterpretation: 'Failed scan with gross head motion exceeding clinical thresholds.',
    },
  ],
});

// ==========================================
// I04: Structural Reconstruction Challenge
// ==========================================
export const I04_STRUCTURAL_CHALLENGE_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i04-structural',
  qcStatus: 'conditional',
  retainedMinutes: 14.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i04',
      segmentationQuality: 'moderate',
      parcelCoverageQuality: 'moderate',
      compositeSpatialDistanceMm: 3.8,
      overallReliabilityScore: 0.78,
      warnings: ['SEGMENTATION_BOUNDARY_UNCERTAINTY'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I04-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 80.0,
      circuitConcordanceRaw: 0.83,
      circuitConcordancePercentile: 0.83,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.78,
      fitInterpretation: 'Candidate verified against fallback cortical search mask.',
    },
  ],
});

// ==========================================
// I05: Atlas Boundary
// ==========================================
export const I05_ATLAS_BOUNDARY_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i05-atlas-boundary',
  qcStatus: 'pass',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i05',
      compositeSpatialDistanceMm: 2.8,
      overallReliabilityScore: 0.86,
      warnings: ['ATLAS_BOUNDARY_UNCERTAINTY'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I05-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 19100,
      parcelName: '46_L / 9-46d_L boundary',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -45, y: 38, z: 32, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -45, y: 38, z: 32, unit: 'mm' },
      clusterAreaMm2: 88.0,
      circuitConcordanceRaw: 0.85,
      circuitConcordancePercentile: 0.85,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.86,
      fitInterpretation: 'Candidate located on HCP-MMP parcel transition zone.',
    },
  ],
});

// ==========================================
// I06: GSR-Sensitive Target (CD-1 vs SD-1 Dispersion)
// ==========================================
export const I06_GSR_SENSITIVE_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i06-gsr-sensitive',
  qcStatus: 'pass',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i06',
      compositeSpatialDistanceMm: 6.2,
      overallReliabilityScore: 0.72,
      warnings: ['ELEVATED_PIPELINE_SENSITIVITY_DISPERSION'],
      limitingFactors: ['ELEVATED_PIPELINE_SENSITIVITY_DISPERSION'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I06-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 75.0,
      circuitConcordanceRaw: 0.81,
      circuitConcordancePercentile: 0.81,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.72,
      fitInterpretation:
        'Candidate exhibits pipeline-sensitivity dispersion between CD-1 and SD-1.',
    },
  ],
});

// ==========================================
// I07: Highly Stable Target (Dual-Run Convergence)
// ==========================================
export const I07_HIGHLY_STABLE_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i07-highly-stable',
  qcStatus: 'pass',
  retainedMinutes: 20.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i07',
      usableRestingStateMinutes: 20.0,
      splitHalfSpatialDistanceMm: 1.4,
      crossRunSpatialDistanceMm: 1.6,
      compositeSpatialDistanceMm: 1.5,
      overallReliabilityScore: 0.96,
      reliabilityClass: 'high',
      isReliableForPersonalisation: true,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I07-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 105.0,
      circuitConcordanceRaw: 0.92,
      circuitConcordancePercentile: 0.92,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.96,
      fitInterpretation: 'Positive control high-stability convergent depression target.',
    },
  ],
});

// ==========================================
// I08: Signal Dropout (Circuit Selective)
// ==========================================
export const I08_SIGNAL_DROPOUT_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i08-signal-dropout',
  qcStatus: 'conditional',
  retainedMinutes: 14.5,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i08',
      overallReliabilityScore: 0.84,
      warnings: ['SUBGENUAL_TSNR_DROPOUT'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I08-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 90.0,
      circuitConcordanceRaw: 0.85,
      circuitConcordancePercentile: 0.85,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.84,
      fitInterpretation:
        'DLPFC circuit remains valid while subgenual seed exhibits susceptibility dropout.',
    },
  ],
});

// ==========================================
// I09: Multi-Scanner Acquisition
// ==========================================
export const I09_MULTI_SCANNER_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i09-multi-scanner',
  qcStatus: 'pass',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i09',
      compositeSpatialDistanceMm: 2.6,
      overallReliabilityScore: 0.9,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I09-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 92.0,
      circuitConcordanceRaw: 0.86,
      circuitConcordancePercentile: 0.86,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.9,
      fitInterpretation: 'Multi-scanner cross-site validated candidate.',
    },
  ],
});

// ==========================================
// I10: Repeat Session (Test-Retest Reproducibility)
// ==========================================
export const I10_REPEAT_SESSION_CONNECTOME: ConnectomeTargetInput = createConnectomeInput({
  connectomeRunId: 'run-i10-repeat-session',
  qcStatus: 'pass',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-i10',
      crossRunSpatialDistanceMm: 2.1,
      compositeSpatialDistanceMm: 2.0,
      overallReliabilityScore: 0.92,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-I10-CONV',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 95.0,
      circuitConcordanceRaw: 0.87,
      circuitConcordancePercentile: 0.87,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.92,
      fitInterpretation:
        'Separate-day repeat session confirming individual biological localisation.',
    },
  ],
});
