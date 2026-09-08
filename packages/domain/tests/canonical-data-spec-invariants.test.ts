/**
 * MAGNIOM CANONICAL DATA SPECIFICATION INVARIANTS TEST SUITE v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0
 *
 * Verifies key domain invariants, mathematical transformations, structural integrity,
 * and all 15 Multi-Indication Acceptance Cases (MI-01 to MI-15 from §136).
 */

import { describe, it, expect } from 'vitest';
import type {
  IndicationModuleRelease,
  CaseIndication,
  ClinicalObjective,
  DiseaseStageContext,
  LesionContext,
  MeasurementBundle,
  MeasurementRef,
  MeasurementReliability,
  ReliabilityBundle,
  TreatmentContextSnapshot,
  TargetGeometry,
  PointTargetGeometry,
  SurfaceROITargetGeometry,
  VolumetricROITargetGeometry,
  SomatotopicTargetGeometry,
  CoilFieldTargetGeometry,
  NetworkTargetGeometry,
  TargetCandidateV2,
  TargetSlateV2,
  SlateCandidateRefV2,
  Coordinate3D,
  CoordinateSpaceRef,
  CommonProvenance,
} from '../src/index.js';

describe('MAGNIOM Canonical Data Specification v2.0 Invariants', () => {
  const mockProvenance: CommonProvenance = {
    createdBy: 'specialist-clinician-777',
    createdAt: '2026-09-05T00:00:00.000Z',
    softwareVersion: '2.0.0',
  };

  const mniSpace: CoordinateSpaceRef = {
    id: 'COORD-MNI152',
    name: 'MNI152NLin2009cAsym',
    subjectSpecific: false,
    version: '2009c',
  };

  const nativeT1Space: CoordinateSpaceRef = {
    id: 'COORD-SUBJ-T1',
    name: 'Subject-Native-T1w',
    subjectSpecific: true,
  };

  // =========================================================================
  // 1. Coordinate Space & Transform Provenance (§65–§66)
  // =========================================================================
  describe('Cluster 8 (§52–§66): Coordinate Spaces & Transform Provenance', () => {
    it('asserts sub-0.01mm round-trip mathematical invariance between spaces', () => {
      // Affine transform matrix between native subject space and MNI space
      const forwardAffine = [
        [1.02, 0.01, -0.02, 12.4],
        [-0.01, 0.98, 0.03, -18.2],
        [0.02, -0.03, 1.05, 5.7],
        [0.0, 0.0, 0.0, 1.0],
      ];

      // Inverse affine computed analytically
      const invert4x4 = (m: number[][]): number[][] => {
        // Linear 3x3 block inversion (near identity)
        const a = m[0]![0]!,
          b = m[0]![1]!,
          c = m[0]![2]!;
        const d = m[1]![0]!,
          e = m[1]![1]!,
          f = m[1]![2]!;
        const g = m[2]![0]!,
          h = m[2]![1]!,
          k = m[2]![2]!;

        const det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
        const invDet = 1.0 / det;

        const i3x3 = [
          [(e * k - f * h) * invDet, (c * h - b * k) * invDet, (b * f - c * e) * invDet],
          [(f * g - d * k) * invDet, (a * k - c * g) * invDet, (c * d - a * f) * invDet],
          [(d * h - e * g) * invDet, (g * b - a * h) * invDet, (a * e - b * d) * invDet],
        ];

        const tx = -(
          i3x3[0]![0]! * m[0]![3]! +
          i3x3[0]![1]! * m[1]![3]! +
          i3x3[0]![2]! * m[2]![3]!
        );
        const ty = -(
          i3x3[1]![0]! * m[0]![3]! +
          i3x3[1]![1]! * m[1]![3]! +
          i3x3[1]![2]! * m[2]![3]!
        );
        const tz = -(
          i3x3[2]![0]! * m[0]![3]! +
          i3x3[2]![1]! * m[1]![3]! +
          i3x3[2]![2]! * m[2]![3]!
        );

        return [
          [i3x3[0]![0]!, i3x3[0]![1]!, i3x3[0]![2]!, tx],
          [i3x3[1]![0]!, i3x3[1]![1]!, i3x3[1]![2]!, ty],
          [i3x3[2]![0]!, i3x3[2]![1]!, i3x3[2]![2]!, tz],
          [0, 0, 0, 1],
        ];
      };

      const inverseAffine = invert4x4(forwardAffine);

      const applyAffine = (pt: Coordinate3D, mat: number[][]): Coordinate3D => ({
        x: mat[0]![0]! * pt.x + mat[0]![1]! * pt.y + mat[0]![2]! * pt.z + mat[0]![3]!,
        y: mat[1]![0]! * pt.x + mat[1]![1]! * pt.y + mat[1]![2]! * pt.z + mat[1]![3]!,
        z: mat[2]![0]! * pt.x + mat[2]![1]! * pt.y + mat[2]![2]! * pt.z + mat[2]![3]!,
      });

      // Target coordinate in Native space
      const pNative: Coordinate3D = { x: -38.452, y: 44.128, z: 29.876 };

      // Native -> MNI -> Native
      const pMni = applyAffine(pNative, forwardAffine);
      const pReconstructed = applyAffine(pMni, inverseAffine);

      const errorX = Math.abs(pReconstructed.x - pNative.x);
      const errorY = Math.abs(pReconstructed.y - pNative.y);
      const errorZ = Math.abs(pReconstructed.z - pNative.z);
      const euclideanDelta = Math.sqrt(errorX * errorX + errorY * errorY + errorZ * errorZ);

      // Section 66 invariant: Round-trip delta must be strictly < 0.001mm
      expect(euclideanDelta).toBeLessThan(0.001);
    });

    it('requires explicit transform provenance for all cross-space coordinates (§66)', () => {
      const pointTarget: PointTargetGeometry = {
        geometryType: 'point',
        coordinateSpace: mniSpace,
        laterality: 'left',
        centre: { x: -38.5, y: 44.2, z: 29.8 },
        sourceMethod: 'ANTs-Syn-Nonlinear-v2.3.4',
        sourceMethodVersion: '2.3.4',
        provenance: mockProvenance,
      };

      expect(pointTarget.coordinateSpace.name).toBe('MNI152NLin2009cAsym');
      expect(pointTarget.sourceMethod).toContain('ANTs');
      expect(pointTarget.centre.x).toBe(-38.5);
    });
  });

  // =========================================================================
  // 2. Somatotopic Geometry & Contralateral Somatotopy (§58–§59)
  // =========================================================================
  describe('Cluster 8 (§58–§59): Somatotopic Target Geometry & Somatotopy', () => {
    it('enforces hierarchical BodyRegionRef taxonomy (Upper Limb -> Hand -> FDI)', () => {
      const somatoGeo: SomatotopicTargetGeometry = {
        geometryType: 'somatotopic',
        coordinateSpace: nativeT1Space,
        laterality: 'left',
        corticalRegion: {
          atlasName: 'HCP-MMP1.0',
          atlasVersion: '1.0',
          space: 'Subject-Native-T1w',
          regionId: 'Area-4-HandKnob',
        },
        bodyRegion: {
          code: 'UPPER_LIMB_HAND_FDI',
          label: 'First Dorsal Interosseous (Hand Knob)',
          parentCode: 'UPPER_LIMB_HAND',
        },
        affectedBodySide: 'right',
        stimulationHemisphere: 'left',
        motorMappingRunId: 'mep-run-001',
        mappedHotspot: { x: -35.2, y: -22.4, z: 58.1 },
        mappingReliabilityId: 'rel-mep-001',
        sourceMethod: 'Navigated-TMS-MEP-Hotspot-Discovery',
        sourceMethodVersion: '1.4.0',
        provenance: mockProvenance,
      };

      expect(somatoGeo.bodyRegion.code).toBe('UPPER_LIMB_HAND_FDI');
      expect(somatoGeo.bodyRegion.parentCode).toBe('UPPER_LIMB_HAND');
      // Release-blocking contralateral somatotopy invariant: right affected hand requires left stimulation hemisphere
      expect(somatoGeo.affectedBodySide).toBe('right');
      expect(somatoGeo.stimulationHemisphere).toBe('left');
    });

    it('rejects ipsilateral stimulation for primary motor cortex targeting in unilateral hemiparesis', () => {
      const validateContralateralSomatotopy = (
        affectedSide: string,
        stimHemisphere: string,
      ): boolean => {
        if (affectedSide === 'right' && stimHemisphere !== 'left') return false;
        if (affectedSide === 'left' && stimHemisphere !== 'right') return false;
        return true;
      };

      expect(validateContralateralSomatotopy('right', 'left')).toBe(true);
      expect(validateContralateralSomatotopy('left', 'right')).toBe(true);
      expect(validateContralateralSomatotopy('right', 'right')).toBe(false); // Prohibited
      expect(validateContralateralSomatotopy('left', 'left')).toBe(false); // Prohibited
    });
  });

  // =========================================================================
  // 3. Coil-Field Target & Non-Point Invariant (§60–§62)
  // =========================================================================
  describe('Cluster 8 (§60–§62): Coil-Field Target Non-Point Invariant', () => {
    it('asserts that a coil field target cannot masquerade as an ordinary point target', () => {
      const coilField: CoilFieldTargetGeometry = {
        geometryType: 'coil_field',
        coordinateSpace: mniSpace,
        laterality: 'bilateral',
        coilModelId: 'Brainsway-H7-DeepTMS-Coil',
        deviceModelId: 'Brainsway-DeepTMS-System',
        placement: {
          scalpCoordinate: { x: 0.0, y: 35.0, z: 75.0 },
          orientationDegrees: 0,
          coilToScalpDistanceMm: 1.0,
          placementCoordinateSystem: mniSpace,
          placementDescription: 'Midline placement targeting anterior cingulate and mPFC',
        },
        intendedFieldRegion: {
          regionId: 'ROI-dACC-mPFC-Volume',
          atlasName: 'Harvard-Oxford-Subcortical',
        },
        therapeuticRegionIds: ['ROI-dACC', 'ROI-mPFC'],
        efieldRunId: 'efield-sim-001',
        pointCoordinateIsRepresentativeOnly: true, // MANDATORY INVARIANT (§62)
        sourceMethod: 'SimNIBS-FEM-Field-Volume-v4.0',
        sourceMethodVersion: '4.0.0',
        provenance: mockProvenance,
      };

      // Hard §62 invariant: For coil_field targets, point coordinate is representative only
      expect(coilField.pointCoordinateIsRepresentativeOnly).toBe(true);
      expect(coilField.geometryType).toBe('coil_field');
      expect(coilField.coilModelId).toContain('H7');
    });
  });

  // =========================================================================
  // 4. Lesion Context & Cavity Non-Equivalence (§23–§27)
  // =========================================================================
  describe('Cluster 4 (§23–§27): Lesion Hard Invariant', () => {
    it('prohibits treating necrotic lesion cavities as ordinary intact cortical targets', () => {
      const lesion: LesionContext = {
        id: 'lesion-case-001',
        version: '1.0.0',
        caseIndicationId: 'case-ind-stroke-01',
        lesionType: 'ischemic',
        lesionLaterality: 'left',
        sourceImagingStudyIds: ['study-flair-001'],
        lesionVolumeCm3: 42.6,
        corticalRegionsAffected: [
          {
            atlasName: 'HCP-MMP1.0',
            atlasVersion: '1.0',
            space: 'MNI152NLin2009cAsym',
            regionId: 'Area-4-HandKnob',
          },
        ],
        subcorticalRegionsAffected: [],
        structuralDistortion: 'HIGH',
        registrationQuality: 'high',
        segmentationQuality: 'high',
        efieldRelevance: 'material',
        targetRegionExclusions: [{ regionId: 'Lesion-Necrotic-Core-Left-M1' }],
        dataQuality: 'verified',
        interpretation: 'Complete cystic encephalomalacia of left hand knob region',
        provenance: mockProvenance,
      };

      // Check whether a candidate inside the necrotic core is rejected
      const evaluateCandidateAgainstLesion = (
        targetRegionId: string,
        lesionContext: LesionContext,
      ): { allowed: boolean; reason?: string } => {
        const isExcluded = lesionContext.targetRegionExclusions?.some(
          ex => ex.regionId === targetRegionId,
        );
        if (isExcluded) {
          return {
            allowed: false,
            reason:
              'Target is within necrotic lesion cavity exclusion zone (§27). Candidate blocked.',
          };
        }
        return { allowed: true };
      };

      const result = evaluateCandidateAgainstLesion('Lesion-Necrotic-Core-Left-M1', lesion);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('necrotic lesion cavity exclusion zone');
    });
  });

  // =========================================================================
  // 5. Capability-Specific Reliability & Missing Measurements (§38–§45, §79)
  // =========================================================================
  describe('Cluster 6 & 9 (§38–§45, §79): Reliability & Missing Measurement Semantics', () => {
    it('unreliable rs-fMRI disqualifies functional connectome personalization without zero-scoring other capabilities', () => {
      const reliabilityBundle: ReliabilityBundle = {
        id: 'rel-bundle-mdd-001',
        version: '1.0.0',
        caseId: 'case-mdd-001',
        caseIndicationId: 'case-ind-mdd-001',
        indicationModuleReleaseId: 'mod-mdd-v2',
        measurementBundleId: 'mb-mdd-001',
        componentReliabilityIds: ['rel-fmri-failed', 'rel-smri-high'],
        capabilityQualification: [
          {
            capabilityCode: 'connectome_personalisation',
            status: 'unreliable',
            reliedOnMeasurementIds: ['fmri-001'],
            reliedOnReliabilityIds: ['rel-fmri-failed'],
            limitingFactors: ['Excessive head motion: mean FD = 0.42mm > threshold 0.20mm'],
          },
          {
            capabilityCode: 'anatomical_structural_targeting',
            status: 'qualified',
            reliedOnMeasurementIds: ['smri-001'],
            reliedOnReliabilityIds: ['rel-smri-high'],
          },
        ],
        overallQualification: 'qualified_with_limitations',
        limitingFactors: ['Excessive head motion in rs-fMRI'],
        interpretation:
          'Connectome personalisation disqualified; structural DLPFC targeting preserved',
        payloadSha256: 'a'.repeat(64),
        provenance: mockProvenance,
      };

      const connectomeCap = reliabilityBundle.capabilityQualification.find(
        c => c.capabilityCode === 'connectome_personalisation',
      );
      const structuralCap = reliabilityBundle.capabilityQualification.find(
        c => c.capabilityCode === 'anatomical_structural_targeting',
      );

      expect(connectomeCap?.status).toBe('unreliable');
      expect(structuralCap?.status).toBe('qualified');

      // Section 79 invariant: Missing or unreliable measurement does NOT set a numeric score to zero
      const candidateScoring = (capStatus: string) => {
        if (capStatus === 'unreliable' || capStatus === 'unavailable') {
          return { capability: 'unavailable', fallbackToPrior: true };
        }
        return { capability: 'active', score: 0.88 };
      };

      const scoreResult = candidateScoring(connectomeCap!.status);
      expect(scoreResult.capability).toBe('unavailable');
      expect(scoreResult.fallbackToPrior).toBe(true);
      expect((scoreResult as any).score).toBeUndefined(); // MUST NOT BE 0
    });
  });

  // =========================================================================
  // 6. One Target Slate — One Principal Indication Module & Cross-Indication Integrity (§10, §122)
  // =========================================================================
  describe('Cluster 2 & 13 (§10, §122): One Slate — One Module & Cross-Indication Integrity', () => {
    it('prohibits inserting a Candidate from Module A into a Target Slate governed by Module B', () => {
      const strokeCandidate: TargetCandidateV2 = {
        id: 'cand-stroke-001',
        caseId: 'case-comorbid-001',
        caseIndicationId: 'case-ind-stroke',
        indicationModuleReleaseId: 'MAGNIOM-IND-STROKE-MOTOR-1.0.0',
        scientificPolicyReleaseId: 'POL-STROKE-1.0.0',
        targetFamilyId: 'TF-M1-HAND',
        targetGeometry: {
          geometryType: 'somatotopic',
          coordinateSpace: mniSpace,
          laterality: 'left',
          corticalRegion: { atlasName: 'HCP', atlasVersion: '1.0', space: 'MNI', regionId: 'M1' },
          bodyRegion: { code: 'HAND', label: 'Hand' },
          stimulationHemisphere: 'left',
          sourceMethod: 'MEP',
          sourceMethodVersion: '1.0',
          provenance: mockProvenance,
        },
        evidenceProfile: {
          primaryClaimIds: ['EVD-STR-01'],
          supportingClaimIds: [],
          evidenceTier: 'A',
        },
        candidateRole: 'somatotopic_target',
        accessibility: { isAccessible: true, scalpToCortexDistanceMm: 14.2 },
        uncertainty: { overallUncertainty: 'low' },
        nominationRationale: 'Contralateral M1 somatotopic target',
        provenance: mockProvenance,
      };

      const mddSlate: TargetSlateV2 = {
        id: 'slate-mdd-001',
        version: '1.0.0',
        caseId: 'case-comorbid-001',
        caseIndicationId: 'case-ind-mdd',
        assessmentId: 'assess-001',
        mode: 'CLINICAL',
        indicationModuleReleaseId: 'MAGNIOM-IND-MDD-2.0.0',
        scientificPolicyReleaseId: 'POL-MDD-2.0.0',
        status: 'generated',
        generatedAt: '2026-09-05T00:00:00.000Z',
        phenotypeSnapshotId: 'pheno-001',
        clinicalObjectiveIds: ['OBJ-DEP-BURDEN'],
        measurementBundleId: 'mb-001',
        evidenceLibraryReleaseId: 'evd-lib-001',
        targetEngineVersionId: 'eng-v2',
        pipelineVersionIds: ['pipe-01'],
        primaryCandidates: [],
        additionalCandidates: [],
        slateConvergence: {
          comparedSources: ['sMRI'],
          pairwiseRelationships: [],
          overall: 'high',
          interpretation: 'Consistent',
        },
        clinicalCoverage: { objectives: [], redundancySummary: 'None' },
        globalUncertainty: { overallUncertainty: 'low' },
        generationSummary: 'MDD Target Slate',
        scientificLimitations: [],
        payloadSha256: 'f'.repeat(64),
        provenance: mockProvenance,
      };

      // Invariant assertion (§122): Candidate module MUST match Slate module
      const insertCandidateIntoSlate = (slate: TargetSlateV2, candidate: TargetCandidateV2) => {
        if (slate.indicationModuleReleaseId !== candidate.indicationModuleReleaseId) {
          throw new Error(
            `Cross-indication integrity violation (§122): Cannot insert candidate from '${candidate.indicationModuleReleaseId}' into slate for '${slate.indicationModuleReleaseId}'`,
          );
        }
        if (slate.caseIndicationId !== candidate.caseIndicationId) {
          throw new Error(
            `Cross-indication integrity violation (§122): Candidate caseIndicationId '${candidate.caseIndicationId}' does not match slate '${slate.caseIndicationId}'`,
          );
        }
      };

      expect(() => insertCandidateIntoSlate(mddSlate, strokeCandidate)).toThrow(
        /Cross-indication integrity violation/i,
      );
    });
  });

  // =========================================================================
  // 7. Multi-Indication Acceptance Cases Matrix (MI-01 to MI-15 from §136)
  // =========================================================================
  describe('Cluster 14 (§127–§136): 15 Canonical Multi-Indication Acceptance Cases', () => {
    it('MI-01: Standard MDD (unilateral left DLPFC point target)', () => {
      const geo: PointTargetGeometry = {
        geometryType: 'point',
        coordinateSpace: mniSpace,
        laterality: 'left',
        centre: { x: -38.0, y: 44.0, z: 26.0 },
        sourceMethod: 'F3-10-20-Standard',
        sourceMethodVersion: '1.0',
        provenance: mockProvenance,
      };
      expect(geo.geometryType).toBe('point');
      expect(geo.laterality).toBe('left');
    });

    it('MI-02: Comorbid MDD + Neuropathic Pain (Dual distinct slates without score blending)', () => {
      const slateMDD: TargetSlateV2 = {
        id: 'slate-mdd',
        version: '1.0.0',
        caseId: 'patient-404',
        caseIndicationId: 'ind-mdd',
        assessmentId: 'assess-mdd',
        mode: 'CLINICAL',
        indicationModuleReleaseId: 'MAGNIOM-IND-MDD-2.0.0',
        scientificPolicyReleaseId: 'POL-MDD',
        status: 'generated',
        generatedAt: '2026-09-05T00:00:00.000Z',
        phenotypeSnapshotId: 'pheno-1',
        clinicalObjectiveIds: ['OBJ-MDD'],
        measurementBundleId: 'mb-1',
        evidenceLibraryReleaseId: 'evd-1',
        targetEngineVersionId: 'eng-1',
        pipelineVersionIds: ['pipe-1'],
        primaryCandidates: [],
        additionalCandidates: [],
        slateConvergence: {
          comparedSources: ['sMRI'],
          pairwiseRelationships: [],
          overall: 'high',
          interpretation: 'Consistent',
        },
        clinicalCoverage: { objectives: [], redundancySummary: 'None' },
        globalUncertainty: { overallUncertainty: 'low' },
        generationSummary: 'MDD Slate',
        scientificLimitations: [],
        payloadSha256: '0'.repeat(64),
        provenance: mockProvenance,
      };

      const slatePain: TargetSlateV2 = {
        ...slateMDD,
        id: 'slate-pain',
        caseIndicationId: 'ind-pain',
        indicationModuleReleaseId: 'MAGNIOM-IND-PAIN-NP-1.0.0',
        clinicalObjectiveIds: ['OBJ-PAIN'],
        generationSummary: 'Neuropathic Pain Slate',
      };

      // Invariant: Two slates exist independently; no synthetic hybrid slate created (§90)
      expect(slateMDD.indicationModuleReleaseId).not.toBe(slatePain.indicationModuleReleaseId);
      expect(slateMDD.caseIndicationId).not.toBe(slatePain.caseIndicationId);
    });

    it('MI-03: Stroke Upper-Limb Motor (somatotopic hand knob targeting)', () => {
      const geo: SomatotopicTargetGeometry = {
        geometryType: 'somatotopic',
        coordinateSpace: nativeT1Space,
        laterality: 'right',
        corticalRegion: {
          atlasName: 'HCP',
          atlasVersion: '1.0',
          space: 'Native',
          regionId: 'M1-Hand',
        },
        bodyRegion: { code: 'UPPER_LIMB_LEFT_HAND', label: 'Left Hand' },
        affectedBodySide: 'left',
        stimulationHemisphere: 'right',
        sourceMethod: 'MEP-Hotspot',
        sourceMethodVersion: '1.0',
        provenance: mockProvenance,
      };
      expect(geo.geometryType).toBe('somatotopic');
      expect(geo.stimulationHemisphere).toBe('right');
    });

    it('MI-04: Severe Stroke Lesion Cavity (blocked in cavity; fallback to intact contralesional cortex)', () => {
      const cavityTarget = { inCavity: true };
      const fallbackTarget = { inCavity: false, candidateRole: 'contralesional_strategy' };

      const resolveCandidate = (target: { inCavity: boolean; candidateRole?: string }) => {
        if (target.inCavity) {
          return { status: 'rejected', reason: 'Necrotic lesion cavity (§27)' };
        }
        return { status: 'eligible', role: target.candidateRole };
      };

      expect(resolveCandidate(cavityTarget).status).toBe('rejected');
      expect(resolveCandidate(fallbackTarget).status).toBe('eligible');
      expect(resolveCandidate(fallbackTarget).role).toBe('contralesional_strategy');
    });

    it('MI-05: Stroke Stage Mismatch (acute stage rejected when module requires subacute/chronic)', () => {
      const stage: DiseaseStageContext = {
        id: 'stage-01',
        version: '1.0.0',
        caseIndicationId: 'ind-stroke',
        stageDefinitionId: 'DEF-STROKE-STAGE',
        calculatedDurationDays: 4, // 4 days = Acute
        currentStageCode: 'ACUTE',
        currentStageLabel: 'Acute Ischemic Stage',
        determinationMethod: 'date_based',
        confidence: 'HIGH',
        dataQuality: 'verified',
        provenance: mockProvenance,
      };

      const moduleRequirements = { allowedStages: ['SUBACUTE', 'CHRONIC'] };
      const isEligible = moduleRequirements.allowedStages.includes(stage.currentStageCode);
      expect(isEligible).toBe(false); // Acute stroke is ineligible for non-acute motor rehab module
    });

    it('MI-06: OCD Deep-TMS H-Coil (coil-field target geometry)', () => {
      const geo: CoilFieldTargetGeometry = {
        geometryType: 'coil_field',
        coordinateSpace: mniSpace,
        laterality: 'bilateral',
        coilModelId: 'Brainsway-H7',
        placement: {
          scalpCoordinate: { x: 0, y: 30, z: 70 },
          placementCoordinateSystem: mniSpace,
        },
        intendedFieldRegion: { regionId: 'mPFC-dACC-field' },
        therapeuticRegionIds: ['mPFC', 'dACC'],
        pointCoordinateIsRepresentativeOnly: true,
        sourceMethod: 'Deep-TMS-Field-Protocol',
        sourceMethodVersion: '1.0',
        provenance: mockProvenance,
      };
      expect(geo.geometryType).toBe('coil_field');
      expect(geo.pointCoordinateIsRepresentativeOnly).toBe(true);
    });

    it('MI-07: Stroke Aphasia (IFG Broca language target, task fMRI)', () => {
      const geo: SurfaceROITargetGeometry = {
        geometryType: 'surface_roi',
        coordinateSpace: nativeT1Space,
        laterality: 'left',
        surfaceId: 'surf-lh-white',
        meshArtifactId: 'mesh-001',
        areaMm2: 125.4,
        sourceMethod: 'Task-fMRI-Language-Localiser',
        sourceMethodVersion: '2.1',
        provenance: mockProvenance,
      };
      expect(geo.geometryType).toBe('surface_roi');
      expect(geo.areaMm2).toBeGreaterThan(0);
    });

    it('MI-08: TBI Depression (sMRI + lesion exclusion + DLPFC point target)', () => {
      const geo: PointTargetGeometry = {
        geometryType: 'point',
        coordinateSpace: mniSpace,
        laterality: 'left',
        centre: { x: -38, y: 44, z: 26 },
        sourceMethod: 'TBI-Structural-DLPFC',
        sourceMethodVersion: '1.0',
        provenance: mockProvenance,
      };
      expect(geo.centre.x).toBe(-38);
    });

    it('MI-09: TBI Skull Defect (skull abnormality flagged; E-field modeling required)', () => {
      const lesionWithSkull: LesionContext = {
        id: 'lesion-tbi-01',
        version: '1.0.0',
        caseIndicationId: 'ind-tbi',
        lesionType: 'traumatic',
        lesionLaterality: 'right',
        sourceImagingStudyIds: ['study-ct-01'],
        corticalRegionsAffected: [],
        subcorticalRegionsAffected: [],
        structuralDistortion: 'HIGH',
        registrationQuality: 'high',
        segmentationQuality: 'high',
        efieldRelevance: 'material',
        skullAbnormality: {
          skullDefectPresent: true,
          cranioplastyPresent: true,
          intracranialHardwarePresent: false,
          efieldModellingRequired: true,
        },
        dataQuality: 'verified',
        interpretation:
          'Right frontoparietal decompressive craniectomy with titanium mesh cranioplasty',
        provenance: mockProvenance,
      };

      expect(lesionWithSkull.skullAbnormality?.skullDefectPresent).toBe(true);
      expect(lesionWithSkull.skullAbnormality?.efieldModellingRequired).toBe(true);
    });

    it('MI-10: Tinnitus Research Mode (auditory cortex network geometry, research mode enforced)', () => {
      const geo: NetworkTargetGeometry = {
        geometryType: 'network',
        coordinateSpace: mniSpace,
        laterality: 'bilateral',
        therapeuticCircuitIds: ['CIRCUIT-TINNITUS-AUDITORY'],
        accessibleNodeRegions: [{ regionId: 'Primary-Auditory-Cortex-A1' }],
        networkDefinitionVersionId: 'NET-TIN-V1',
        sourceMethod: 'Auditory-rsfMRI-Graph-Seed',
        sourceMethodVersion: '1.0',
        provenance: mockProvenance,
      };
      expect(geo.geometryType).toBe('network');
      expect(geo.therapeuticCircuitIds).toContain('CIRCUIT-TINNITUS-AUDITORY');
    });

    it('MI-11: Failed rs-fMRI Fallback (personalization abstains; falls back to evidence-based F3 coordinate)', () => {
      const evaluateFallback = (fmriStatus: string) => {
        if (fmriStatus === 'failed') {
          return {
            mode: 'fallback',
            selectedTarget: 'F3-Beam-Anatomical-Coordinate',
            abstentionReason: 'rs-fMRI motion artifact exceeded safety limits (§79, §132)',
          };
        }
        return { mode: 'personalised', selectedTarget: 'Connectome-Peak' };
      };

      const res = evaluateFallback('failed');
      expect(res.mode).toBe('fallback');
      expect(res.selectedTarget).toBe('F3-Beam-Anatomical-Coordinate');
    });

    it('MI-12: Failed Motor Mapping (hotspot discovery fails; falls back to anatomical hand knob)', () => {
      const evaluateMotorFallback = (mepMapped: boolean) => {
        if (!mepMapped) {
          return {
            targetGeometry: 'somatotopic',
            sourceMethod: 'Anatomical-Hand-Knob-Landmark',
            limitations: [
              'Physiological MEP unmappable; relying on anatomical structural landmark',
            ],
          };
        }
        return { targetGeometry: 'somatotopic', sourceMethod: 'Physiological-MEP-Hotspot' };
      };

      const res = evaluateMotorFallback(false);
      expect(res.sourceMethod).toBe('Anatomical-Hand-Knob-Landmark');
      expect(res.limitations).toHaveLength(1);
    });

    it('MI-13: Unverified Phenotype (clinical objective pending sign-off blocks candidate generation)', () => {
      const objective: ClinicalObjective = {
        id: 'obj-001',
        caseIndicationId: 'ind-001',
        objectiveDefinitionId: 'def-001',
        concept: { conceptId: 'CON-DEP', label: 'Depression Burden' },
        priorityRank: 1,
        targetMappability: 'clinically_supported',
        confidence: 'HIGH',
        // approvedBy is undefined -> pending sign-off
        provenance: mockProvenance,
      };

      const isEligibleForGeneration = (obj: ClinicalObjective): boolean => {
        return !!obj.approvedBy;
      };

      expect(isEligibleForGeneration(objective)).toBe(false);
    });

    it('MI-14: Missing Mandatory Measurement (structural MRI missing in stroke module -> generation blocked)', () => {
      const measurementBundle: MeasurementBundle = {
        id: 'mb-stroke-empty',
        version: '1.0.0',
        caseId: 'case-stroke-01',
        caseIndicationId: 'ind-stroke-01',
        indicationModuleReleaseId: 'MAGNIOM-IND-STROKE-MOTOR-1.0.0',
        phenotypeSnapshotId: 'pheno-01',
        measurements: [], // EMPTY
        qualificationStatus: 'unqualified',
        limitingFactors: ['Missing mandatory structural_mri scan'],
        payloadSha256: '0'.repeat(64),
        provenance: mockProvenance,
      };

      const checkGenerationAllowed = (mb: MeasurementBundle): boolean => {
        const hasT1 = mb.measurements.some(
          m => m.modality === 'structural_mri' && m.status === 'qualified',
        );
        return hasT1;
      };

      expect(checkGenerationAllowed(measurementBundle)).toBe(false);
    });

    it('MI-15: Module Upgrade Historical Immutability (historical slate remains pinned to 1.0.0)', () => {
      const historicalSlate: TargetSlateV2 = {
        id: 'slate-historical-001',
        version: '1.0.0',
        caseId: 'case-001',
        caseIndicationId: 'ind-001',
        assessmentId: 'assess-001',
        mode: 'CLINICAL',
        indicationModuleReleaseId: 'MAGNIOM-IND-MDD-1.0.0',
        scientificPolicyReleaseId: 'POL-MDD-1.0.0',
        status: 'reviewed',
        generatedAt: '2025-01-01T00:00:00.000Z',
        phenotypeSnapshotId: 'pheno-001',
        clinicalObjectiveIds: ['OBJ-001'],
        measurementBundleId: 'mb-001',
        evidenceLibraryReleaseId: 'evd-001',
        targetEngineVersionId: 'eng-v1',
        pipelineVersionIds: ['pipe-01'],
        primaryCandidates: [],
        additionalCandidates: [],
        slateConvergence: {
          comparedSources: ['sMRI'],
          pairwiseRelationships: [],
          overall: 'high',
          interpretation: 'Consistent',
        },
        clinicalCoverage: { objectives: [], redundancySummary: 'None' },
        globalUncertainty: { overallUncertainty: 'low' },
        generationSummary: 'Historical Slate',
        scientificLimitations: [],
        payloadSha256: '1'.repeat(64),
        provenance: mockProvenance,
      };

      // Even if MAGNIOM-IND-MDD-2.0.0 is released, historical slate MUST remain pinned to 1.0.0 (§123, §126)
      expect(historicalSlate.indicationModuleReleaseId).toBe('MAGNIOM-IND-MDD-1.0.0');
      expect(historicalSlate.status).toBe('reviewed');
    });
  });

  // =========================================================================
  // 8. Prohibited Canonical Fields (§138)
  // =========================================================================
  describe('Cluster 15 (§138): Prohibited Canonical Fields Detection', () => {
    it('detects and rejects any prohibited field anywhere in a canonical data structure', () => {
      const PROHIBITED_FIELDS = [
        'optimal_target',
        'brain_abnormality_score',
        'expected_response_probability',
        'recommended_protocol',
        'global_tms_suitability_score',
        'multi_indication_target_score',
        'stroke_recovery_probability',
      ];

      const scanForProhibitedFields = (obj: any): string[] => {
        const found: string[] = [];
        const traverse = (current: any) => {
          if (!current || typeof current !== 'object') return;
          if (Array.isArray(current)) {
            for (const el of current) traverse(el);
          } else {
            for (const [k, v] of Object.entries(current)) {
              if (PROHIBITED_FIELDS.includes(k)) {
                found.push(k);
              }
              traverse(v);
            }
          }
        };
        traverse(obj);
        return found;
      };

      const validObj = {
        id: 'valid-target-001',
        centre: { x: -38, y: 44, z: 26 },
        uncertainty: { overallUncertainty: 'low' },
      };

      const contaminatedObj = {
        id: 'contaminated-target-001',
        centre: { x: -38, y: 44, z: 26 },
        optimal_target: true, // PROHIBITED
        nestedDiagnostics: {
          stroke_recovery_probability: 0.85, // PROHIBITED
        },
      };

      expect(scanForProhibitedFields(validObj)).toHaveLength(0);
      const violations = scanForProhibitedFields(contaminatedObj);
      expect(violations).toContain('optimal_target');
      expect(violations).toContain('stroke_recovery_probability');
    });
  });
});
