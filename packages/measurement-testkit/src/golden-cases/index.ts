/**
 * @magniom/measurement-testkit - Golden Multimodal Cases (MM-01 through MM-12)
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§169)
 */

import type {
  MeasurementBundle,
  ReliabilityBundle,
  CapabilityQualificationStatus,
  ReliabilityCapabilityQualification,
} from '@magniom/domain';
import {
  RestingStateProvider,
  LesionMappingProvider,
  MotorMappingProvider,
  TaskFMRIProvider,
  AudiologyProvider,
  DiffusionProvider,
  StructuralMRIProvider,
  EFieldProvider,
} from '@magniom/modalities';
import { MeasurementBundleAssembler, type MeasurementRunContext } from '@magniom/measurement-core';
import { computeSha256 } from '@magniom/scientific-policy';

function makeCapQual(
  capabilityCode: string,
  status: CapabilityQualificationStatus,
  measurementId: string,
  reliabilityId: string,
  explanation: string,
): ReliabilityCapabilityQualification {
  return {
    capabilityCode,
    status,
    reliedOnMeasurementIds: [measurementId],
    reliedOnReliabilityIds: [reliabilityId],
    policyRuleId: `RULE-${capabilityCode.toUpperCase()}`,
    explanation,
  };
}

export interface GoldenMultimodalCase {
  readonly caseCode: string;
  readonly indication: string;
  readonly description: string;
  readonly buildBundles: () => {
    readonly measurementBundle: MeasurementBundle;
    readonly reliabilityBundle: ReliabilityBundle;
  };
  readonly expectedOutcome: {
    readonly measurementQualified: boolean;
    readonly targetRefinementPermitted: boolean;
    readonly expectedTargetCandidateFamily: string;
    readonly notes: string;
  };
}

export const GOLDEN_MULTIMODAL_CASES: Record<string, GoldenMultimodalCase> = {
  // -------------------------------------------------------------------------
  // MM-01: MDD, qualified rs-fMRI
  // -------------------------------------------------------------------------
  'MM-01': {
    caseCode: 'MM-01',
    indication: 'MDD',
    description: 'MDD with qualified rs-fMRI, sgACC anti-correlation peak in DLPFC.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000001';
      const rsProvider = new RestingStateProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          {
            path: 'sub-01_task-rest_bold.nii.gz',
            content: 'BOLD',
            sha256: computeSha256('BOLD-01'),
          },
        ],
        pipelineVersionId: 'PIPE-RSFMRI-CONNECTOME-2.0.0',
        configurationParameters: {
          acquiredDurationSeconds: 900,
          meanFramewiseDisplacementMm: 0.16,
          scrubbedVolumesFraction: 0.08,
          splitHalfStabilityR: 0.84,
          sgAccDlpfcConcordance: -0.72,
        },
      };

      const result = rsProvider.process(context);
      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-01',
        caseId,
        caseIndicationId: 'IND-MDD-01',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-MDD',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000101',
        measurements: [result.measurement],
        requiredCapabilities: ['individual_fc_refinement'],
        provenance: result.measurement.provenance,
      });

      const capQual = rsProvider.qualifyCapability(
        'individual_fc_refinement',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-MDD',
      );

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-01',
        caseId,
        caseIndicationId: 'IND-MDD-01',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-MDD',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'individual_fc_refinement',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: true,
      expectedTargetCandidateFamily: 'dlpfc_ba46_sgacc_anticorrelated',
      notes:
        'Full rs-fMRI connectivity qualification enables individual DLPFC coordinate refinement.',
    },
  },

  // -------------------------------------------------------------------------
  // MM-02: MDD, failed rs-fMRI motion QC
  // -------------------------------------------------------------------------
  'MM-02': {
    caseCode: 'MM-02',
    indication: 'MDD',
    description: 'MDD with failed rs-fMRI QC (excessive motion FD=0.48mm, retained=380s).',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000002';
      const rsProvider = new RestingStateProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          {
            path: 'sub-02_task-rest_bold.nii.gz',
            content: 'BOLD',
            sha256: computeSha256('BOLD-02'),
          },
        ],
        pipelineVersionId: 'PIPE-RSFMRI-CONNECTOME-2.0.0',
        configurationParameters: {
          acquiredDurationSeconds: 600,
          meanFramewiseDisplacementMm: 0.48,
          scrubbedVolumesFraction: 0.45,
          splitHalfStabilityR: 0.32,
          sgAccDlpfcConcordance: -0.22,
        },
      };

      const result = rsProvider.process(context);
      const capQual = rsProvider.qualifyCapability(
        'individual_fc_refinement',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-MDD',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-02',
        caseId,
        caseIndicationId: 'IND-MDD-02',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-MDD',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000102',
        measurements: [{ ...result.measurement, status: 'failed' }],
        requiredCapabilities: ['individual_fc_refinement'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-02',
        caseId,
        caseIndicationId: 'IND-MDD-02',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-MDD',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'individual_fc_refinement',
            'not_qualified',
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: false,
      targetRefinementPermitted: false,
      expectedTargetCandidateFamily: 'dlpfc_ba46_beam_f3_evidence_baseline',
      notes:
        'Gate G4/G5 rejects degraded rs-fMRI and gracefully falls back to evidence baseline target.',
    },
  },

  // -------------------------------------------------------------------------
  // MM-03: Stroke, large lesion with preserved perilesional cortex (§169)
  // -------------------------------------------------------------------------
  'MM-03': {
    caseCode: 'MM-03',
    indication: 'Stroke Motor',
    description:
      'Stroke with large ischemic lesion; LesionContext generated, target-family intersections identified.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000003';
      const lesionProvider = new LesionMappingProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          {
            path: 'sub-03_lesion_mask.nii.gz',
            content: 'LESION-MASK',
            sha256: computeSha256('LESION-03'),
          },
        ],
        pipelineVersionId: 'PIPE-LESION-MAP-2.0.0',
        configurationParameters: {
          lesionType: 'ischemic_stroke_mca',
          laterality: 'left',
          volumeMm3: 45000,
          isTargetDestroyed: false,
          intersectedTargetFamilyIds: ['ipsilesional_premotor', 'supplementary_motor_area'],
          nearestIntactCortexDistanceMm: 4.5,
        },
      };

      const result = lesionProvider.process(context);
      const capQual = lesionProvider.qualifyCapability(
        'lesion_context',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-STROKE-MOTOR',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-03',
        caseId,
        caseIndicationId: 'IND-STROKE-03',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-MOTOR',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000103',
        measurements: [result.measurement],
        requiredCapabilities: ['lesion_context'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-03',
        caseId,
        caseIndicationId: 'IND-STROKE-03',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-MOTOR',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'lesion_context',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: true,
      expectedTargetCandidateFamily: 'ipsilesional_premotor_or_sma',
      notes:
        'LesionContext successfully generated; preserves perilesional tissue and identifies valid target families (§169).',
    },
  },

  // -------------------------------------------------------------------------
  // MM-04: Stroke Motor where ischemic lesion destroys M1 hand knob
  // -------------------------------------------------------------------------
  'MM-04': {
    caseCode: 'MM-04',
    indication: 'Stroke Motor',
    description: 'Stroke Motor where ischemic lesion destroys M1 hand knob.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000004';
      const lesionProvider = new LesionMappingProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          {
            path: 'sub-04_lesion_mask.nii.gz',
            content: 'MASK',
            sha256: computeSha256('LESION-04'),
          },
        ],
        pipelineVersionId: 'PIPE-LESION-MAP-2.0.0',
        configurationParameters: {
          lesionType: 'ischemic',
          laterality: 'left',
          volumeMm3: 65000,
          isTargetDestroyed: true,
          intersectedTargetFamilyIds: ['ipsilesional_m1_hand_knob'],
          nearestIntactCortexDistanceMm: 0,
        },
      };

      const result = lesionProvider.process(context);
      const capQual = lesionProvider.qualifyCapability(
        'target_destruction_check',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-STROKE-MOTOR',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-04',
        caseId,
        caseIndicationId: 'IND-STROKE-04',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-MOTOR',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000104',
        measurements: [result.measurement],
        requiredCapabilities: ['target_destruction_check'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-04',
        caseId,
        caseIndicationId: 'IND-STROKE-04',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-MOTOR',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'target_destruction_check',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: false,
      expectedTargetCandidateFamily: 'contralesional_m1_suppression_or_premotor',
      notes:
        'Target destruction check detects destroyed M1 hand knob; rejects ipsilesional M1 target.',
    },
  },

  // -------------------------------------------------------------------------
  // MM-05: Neuropathic Pain with reproducible motor hotspot (2.8mm)
  // -------------------------------------------------------------------------
  'MM-05': {
    caseCode: 'MM-05',
    indication: 'Neuropathic Pain',
    description:
      'Neuropathic Pain with highly reproducible motor mapping hotspot (repeatability 2.8mm).',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000005';
      const motorProvider = new MotorMappingProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-05_tms_motor_map.xml', content: 'NAV', sha256: computeSha256('NAV-05') },
        ],
        pipelineVersionId: 'PIPE-MOTOR-MAP-COG-2.0.0',
        configurationParameters: {
          muscleCode: 'FDI',
          muscleLaterality: 'right',
          repeatabilityMm: 2.8,
        },
      };

      const result = motorProvider.process(context);
      const capQual = motorProvider.qualifyCapability(
        'motor_hotspot_refinement',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-05',
        caseId,
        caseIndicationId: 'IND-PAIN-05',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000105',
        measurements: [result.measurement],
        requiredCapabilities: ['motor_hotspot_refinement'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-05',
        caseId,
        caseIndicationId: 'IND-PAIN-05',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'motor_hotspot_refinement',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: true,
      expectedTargetCandidateFamily: 'somatotopic_m1_hand_hotspot',
      notes: 'Sub-5mm hotspot repeatability qualifies patient-specific somatotopic M1 coordinate.',
    },
  },

  // -------------------------------------------------------------------------
  // MM-06: Neuropathic Pain with unstable motor hotspot (§169)
  // -------------------------------------------------------------------------
  'MM-06': {
    caseCode: 'MM-06',
    indication: 'Neuropathic Pain',
    description:
      'Neuropathic Pain with unstable motor mapping hotspot (repeatability 12.4mm > 5.0mm threshold).',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000006';
      const motorProvider = new MotorMappingProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-06_tms_motor_map.xml', content: 'NAV', sha256: computeSha256('NAV-06') },
        ],
        pipelineVersionId: 'PIPE-MOTOR-MAP-COG-2.0.0',
        configurationParameters: {
          muscleCode: 'FDI',
          muscleLaterality: 'right',
          repeatabilityMm: 12.4, // Unstable hotspot (> 5mm threshold)
        },
      };

      const result = motorProvider.process(context);
      const capQual = motorProvider.qualifyCapability(
        'motor_hotspot_refinement',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-06',
        caseId,
        caseIndicationId: 'IND-PAIN-06',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000106',
        measurements: [result.measurement],
        requiredCapabilities: ['motor_hotspot_refinement'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-06',
        caseId,
        caseIndicationId: 'IND-PAIN-06',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'motor_hotspot_refinement',
            'not_qualified',
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: false,
      targetRefinementPermitted: false,
      expectedTargetCandidateFamily: 'anatomical_m1_hand_knob_baseline',
      notes:
        'Unstable hotspot repeatability (>5mm) disqualifies patient-specific refinement; falls back to anatomical baseline (§169).',
    },
  },

  // -------------------------------------------------------------------------
  // MM-07: Stroke Aphasia, successful language task performance (§169)
  // -------------------------------------------------------------------------
  'MM-07': {
    caseCode: 'MM-07',
    indication: 'Stroke Aphasia',
    description:
      'Stroke Aphasia with successful task compliance (accuracy 88%) and robust perilesional activation.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000007';
      const taskProvider = new TaskFMRIProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          {
            path: 'sub-07_task-language_bold.nii.gz',
            content: 'TASK-BOLD-07',
            sha256: computeSha256('TASK-07'),
          },
          { path: 'sub-07_events.log', content: 'LOG-07', sha256: computeSha256('LOG-07') },
        ],
        pipelineVersionId: 'PIPE-TASKFMRI-GLM-2.0.0',
        configurationParameters: {
          taskAccuracyRate: 0.88,
          lateralityIndex: 0.76,
        },
      };

      const result = taskProvider.process(context);
      const capQual = taskProvider.qualifyCapability(
        'functional_localisation',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-STROKE-APHASIA',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-07',
        caseId,
        caseIndicationId: 'IND-APHASIA-07',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-APHASIA',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000107',
        measurements: [result.measurement],
        requiredCapabilities: ['functional_localisation'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-07',
        caseId,
        caseIndicationId: 'IND-APHASIA-07',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-APHASIA',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'functional_localisation',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: true,
      expectedTargetCandidateFamily: 'perilesional_broca_wernicke_functional_hotspot',
      notes:
        'High task compliance (88%) validates task-evoked functional activation for aphasia targeting (§169).',
    },
  },

  // -------------------------------------------------------------------------
  // MM-08: Stroke Aphasia, failed task performance (behavioral non-compliance)
  // -------------------------------------------------------------------------
  'MM-08': {
    caseCode: 'MM-08',
    indication: 'Stroke Aphasia',
    description:
      'Task fMRI failed behavioral compliance (accuracy 35%). Cortical tissue must NOT be marked dead.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000008';
      const taskProvider = new TaskFMRIProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          {
            path: 'sub-08_task-language_bold.nii.gz',
            content: 'TASK-BOLD',
            sha256: computeSha256('TASK-08'),
          },
          { path: 'sub-08_events.log', content: 'LOG', sha256: computeSha256('LOG-08') },
        ],
        pipelineVersionId: 'PIPE-TASKFMRI-GLM-2.0.0',
        configurationParameters: {
          taskAccuracyRate: 0.35,
          lateralityIndex: 0.12,
        },
      };

      const result = taskProvider.process(context);
      const capQual = taskProvider.qualifyCapability(
        'functional_localisation',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-STROKE-APHASIA',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-08',
        caseId,
        caseIndicationId: 'IND-APHASIA-08',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-APHASIA',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000108',
        measurements: [result.measurement],
        requiredCapabilities: ['functional_localisation'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-08',
        caseId,
        caseIndicationId: 'IND-APHASIA-08',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-APHASIA',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'functional_localisation',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: false,
      targetRefinementPermitted: false,
      expectedTargetCandidateFamily: 'anatomical_broca_wernicke_evidence_baseline',
      notes:
        'Behavioral task failure blocks task-evoked target refinement, but cortical area remains anatomically viable.',
    },
  },

  // -------------------------------------------------------------------------
  // MM-09: TBI with skull defect / craniectomy (§169)
  // -------------------------------------------------------------------------
  'MM-09': {
    caseCode: 'MM-09',
    indication: 'TBI',
    description:
      'TBI with skull defect / decompressive craniectomy; structural context available for E-field workflow.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000009';
      const structuralProvider = new StructuralMRIProvider();
      const efieldProvider = new EFieldProvider();

      const structContext: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-09_T1w.nii.gz', content: 'T1', sha256: computeSha256('T1-09') },
        ],
        pipelineVersionId: 'PIPE-STRUCTURAL-2.0.0',
        configurationParameters: {
          hasAnatomicalAbnormality: true,
          anatomicalNotes: 'Right frontoparietal craniectomy defect.',
        },
      };

      const efieldContext: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-09_headmodel.msh', content: 'HEAD', sha256: computeSha256('HEAD-09') },
        ],
        pipelineVersionId: 'PIPE-EFIELD-SIM-2.0.0',
        configurationParameters: {
          peakCorticalEFieldVm: 125,
          accessibilityAttenuationFactor: 0.65, // Defect alters conductivity & attenuation
        },
      };

      const structResult = structuralProvider.process(structContext);
      const efieldResult = efieldProvider.process(efieldContext);

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-09',
        caseId,
        caseIndicationId: 'IND-TBI-09',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TBI',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000109',
        measurements: [structResult.measurement, efieldResult.measurement],
        requiredCapabilities: ['anatomical_localisation', 'efield_attenuation_context'],
        provenance: structResult.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-09',
        caseId,
        caseIndicationId: 'IND-TBI-09',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TBI',
        measurementBundleId: mBundle.id,
        reliabilities: [structResult.reliability, efieldResult.reliability],
        capabilityQualifications: [
          makeCapQual(
            'anatomical_localisation',
            'qualified',
            structResult.measurement.id,
            structResult.reliability.id,
            'Anatomical segmentation complete with skull defect flags',
          ),
          makeCapQual(
            'efield_attenuation_context',
            'qualified',
            efieldResult.measurement.id,
            efieldResult.reliability.id,
            'E-field simulation accounts for craniectomy boundary condition',
          ),
        ],
        provenance: structResult.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: true,
      expectedTargetCandidateFamily: 'dorsolateral_prefrontal_cortex_skull_corrected',
      notes:
        'Structural/skull defect context available for E-field workflow, adjusting stimulation physics (§169).',
    },
  },

  // -------------------------------------------------------------------------
  // MM-10: DWI tractography instability (§169)
  // -------------------------------------------------------------------------
  'MM-10': {
    caseCode: 'MM-10',
    indication: 'Stroke Motor',
    description:
      'DWI tractography with high angular instability; structural connectivity refinement not qualified.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000010';
      const dwiProvider = new DiffusionProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-10_dwi.nii.gz', content: 'DWI-10', sha256: computeSha256('DWI-10') },
          { path: 'sub-10_dwi.bvec', content: 'BVEC-10', sha256: computeSha256('BVEC-10') },
          { path: 'sub-10_dwi.bval', content: 'BVAL-10', sha256: computeSha256('BVAL-10') },
        ],
        pipelineVersionId: 'PIPE-DIFFUSION-TRACTS-2.0.0',
        configurationParameters: {
          bValueCount: 1,
          gradientDirectionsCount: 30,
          reconstructionStability: 'unstable',
          corticospinalTractIntact: false,
        },
      };

      const result = dwiProvider.process(context);
      const capQual = dwiProvider.qualifyCapability(
        'structural_connectivity_refinement',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-STROKE-MOTOR',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-10',
        caseId,
        caseIndicationId: 'IND-STROKE-10',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-MOTOR',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000110',
        measurements: [result.measurement],
        requiredCapabilities: ['structural_connectivity_refinement'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-10',
        caseId,
        caseIndicationId: 'IND-STROKE-10',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-STROKE-MOTOR',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'structural_connectivity_refinement',
            'not_qualified',
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: false,
      targetRefinementPermitted: false,
      expectedTargetCandidateFamily: 'evidence_baseline_premotor',
      notes:
        'Tractography reconstruction instability disqualifies structural connectivity refinement (§169).',
    },
  },

  // -------------------------------------------------------------------------
  // MM-11: Tinnitus, complete audiometry profile (§169)
  // -------------------------------------------------------------------------
  'MM-11': {
    caseCode: 'MM-11',
    indication: 'Tinnitus',
    description:
      'Tinnitus with complete pure-tone audiometry and pitch matching; research measurement bundle qualified.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000011';
      const audProvider = new AudiologyProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-11_audiogram.xml', content: 'AUDIO-11', sha256: computeSha256('AUD-11') },
        ],
        pipelineVersionId: 'PIPE-AUDIOLOGY-STANDARDS-2.0.0',
        configurationParameters: {
          tinnitusLaterality: 'bilateral',
          matchedFrequencyHz: 4000,
          transducerCalibrated: true,
        },
      };

      const result = audProvider.process(context);
      const capQual = audProvider.qualifyCapability(
        'tinnitus_phenotype_context',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-TINNITUS',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-11',
        caseId,
        caseIndicationId: 'IND-TINNITUS-11',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TINNITUS',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000111',
        measurements: [result.measurement],
        requiredCapabilities: ['tinnitus_phenotype_context'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-11',
        caseId,
        caseIndicationId: 'IND-TINNITUS-11',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TINNITUS',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'tinnitus_phenotype_context',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: true,
      expectedTargetCandidateFamily: 'temporoparietal_junction_research',
      notes:
        'Complete audiologic profile qualifies research measurement bundle for tinnitus phenotype characterization (§169).',
    },
  },

  // -------------------------------------------------------------------------
  // MM-12: Tinnitus pitch match without clinical EvidencePath (§169)
  // -------------------------------------------------------------------------
  'MM-12': {
    caseCode: 'MM-12',
    indication: 'Tinnitus',
    description:
      'Tinnitus pitch match present (6kHz), but autonomous pitch-to-cortex generator is prohibited.',
    buildBundles: () => {
      const caseId = '00000000-0000-0000-0000-000000000012';
      const audProvider = new AudiologyProvider();
      const context: MeasurementRunContext = {
        caseId,
        organisationId: '00000000-0000-0000-0000-000000000000',
        rawInputArtifacts: [
          { path: 'sub-12_audiogram.xml', content: 'AUDIO', sha256: computeSha256('AUD-12') },
        ],
        pipelineVersionId: 'PIPE-AUDIOLOGY-STANDARDS-2.0.0',
        configurationParameters: {
          tinnitusLaterality: 'left',
          matchedFrequencyHz: 6000,
          transducerCalibrated: true,
        },
      };

      const result = audProvider.process(context);
      const capQual = audProvider.qualifyCapability(
        'tinnitus_laterality_context',
        result.measurement,
        result.reliability,
        'MAGNIOM-MODULE-TINNITUS',
      );

      const mBundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-MM-12',
        caseId,
        caseIndicationId: 'IND-TINNITUS-12',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TINNITUS',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000112',
        measurements: [result.measurement],
        requiredCapabilities: ['tinnitus_laterality_context'],
        provenance: result.measurement.provenance,
      });

      const rBundle = MeasurementBundleAssembler.assembleReliabilityBundle({
        reliabilityBundleId: 'REL-BUNDLE-MM-12',
        caseId,
        caseIndicationId: 'IND-TINNITUS-12',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TINNITUS',
        measurementBundleId: mBundle.id,
        reliabilities: [result.reliability],
        capabilityQualifications: [
          makeCapQual(
            'tinnitus_laterality_context',
            capQual.qualification,
            result.measurement.id,
            result.reliability.id,
            capQual.reasons.join('; '),
          ),
        ],
        provenance: result.measurement.provenance,
      });

      return { measurementBundle: mBundle, reliabilityBundle: rBundle };
    },
    expectedOutcome: {
      measurementQualified: true,
      targetRefinementPermitted: false,
      expectedTargetCandidateFamily: 'temporoparietal_junction_or_auditory_cortex_baseline',
      notes:
        'Audiology context accepted, but autonomous tonotopic pitch-to-cortex coordinate calculation is blocked without EvidencePath.',
    },
  },
};
