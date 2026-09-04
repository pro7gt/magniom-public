import { describe, it, expect } from 'vitest';
import {
  validateIndicationModuleReleaseRules,
  validateDiseaseStageContextRules,
  validateLesionContextRules,
  validateMeasurementBundleRules,
  validateReliabilityBundleRules,
  validateTargetGeometryRules,
  validateTargetCandidateRules,
  validateTargetSlateRules,
  validateCrossCaseIntegrity,
  validateCrossIndicationIntegrity,
  validateModuleVersionIntegrity,
  validateLesionTargetRelationship,
  validateMotorMappingFitProfile,
  validateTargetTreatmentContextEvaluation,
  validateCrossIndicationTargetReview,
  validateClinicianModifiedTarget,
  validateTargetEngineInputV2,
  DomainValidationError,
} from '../src/index.js';

describe('MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§136 Multi-Indication Acceptance Cases)', () => {
  const mockProvenance = {
    createdBy: 'system-spec-validator',
    createdAt: '2026-09-03T00:00:00.000Z',
    softwareVersion: '2.0.0',
  };

  const defaultCoordSpace = {
    id: 'space-mni',
    name: 'MNI152NLin2009cAsym',
    subjectSpecific: false,
  };

  // -------------------------------------------------------------------------
  // MI-01: Major Depressive Disorder (Standard point-based psychiatric target)
  // -------------------------------------------------------------------------
  it('MI-01 — MDD: represents standard point-based left DLPFC targeting', () => {
    const pointGeometry = {
      geometryType: 'point',
      coordinateSpace: defaultCoordSpace,
      laterality: 'left',
      sourceMethod: 'individual_fc_sgacc_dlpfc',
      sourceMethodVersion: '2.0.0',
      centre: { x: -44, y: 40, z: 28 },
      provenance: mockProvenance,
    };

    expect(() => validateTargetGeometryRules(pointGeometry, ['point'])).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-02: Neuropathic hand pain (Somatotopic M1 target)
  // -------------------------------------------------------------------------
  it('MI-02 — Neuropathic hand pain: represents somatotopic M1 hand target', () => {
    const somatotopicGeometry = {
      geometryType: 'somatotopic',
      coordinateSpace: {
        id: 'space-subject',
        name: 'T1w_native',
        subjectSpecific: true,
      },
      laterality: 'left',
      sourceMethod: 'navigated_motor_mapping',
      sourceMethodVersion: '1.2.0',
      corticalRegion: {
        atlasName: 'HCP_MMP1.0',
        atlasVersion: '1.0',
        space: 'MNI152NLin2009cAsym',
      },
      bodyRegion: {
        code: 'HAND',
        label: 'Hand knob (Motor hand representation)',
      },
      stimulationHemisphere: 'left',
      mappedHotspot: { x: -36, y: -22, z: 58 },
      provenance: mockProvenance,
    };

    expect(() =>
      validateTargetGeometryRules(somatotopicGeometry, ['somatotopic', 'point']),
    ).not.toThrow();

    const motorMappingFit = {
      motorMappingRunId: '00000000-0000-0000-0000-000000000010',
      relevantBodyRegion: { code: 'HAND', label: 'Hand' },
      hotspotCoordinate: { x: -36, y: -22, z: 58 },
      candidateToHotspotDistanceMm: 1.2,
      mapOverlap: 0.94,
      mapReliabilityId: '00000000-0000-0000-0000-000000000011',
      interpretation: 'High concordance with motor-evoked potential hand hotspot.',
    };

    expect(() => validateMotorMappingFitProfile(motorMappingFit)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-03: Bilateral neuropathic pain (Explicit bilateral somatotopic representation)
  // -------------------------------------------------------------------------
  it('MI-03 — Bilateral neuropathic pain: avoids false unilateral simplification', () => {
    const bilateralGeometry = {
      geometryType: 'somatotopic',
      coordinateSpace: defaultCoordSpace,
      laterality: 'bilateral',
      sourceMethod: 'bilateral_somatosensory_mapping',
      sourceMethodVersion: '1.0.0',
      corticalRegion: {
        atlasName: 'HCP_MMP1.0',
        atlasVersion: '1.0',
        space: 'MNI152NLin2009cAsym',
      },
      bodyRegion: {
        code: 'UPPER_LIMBS_BILATERAL',
        label: 'Bilateral upper extremity representation',
      },
      stimulationHemisphere: 'bilateral',
      provenance: mockProvenance,
    };

    expect(() => validateTargetGeometryRules(bilateralGeometry, ['somatotopic'])).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-04 & MI-05: Subacute vs Chronic Motor Stroke (DiseaseStageContext differentiation)
  // -------------------------------------------------------------------------
  it('MI-04 & MI-05 — Subacute vs Chronic Stroke: differentiates stage applicability', () => {
    const subacuteStage = {
      id: '00000000-0000-0000-0000-000000000041',
      version: '1.0.0',
      caseIndicationId: '00000000-0000-0000-0000-000000000040',
      stageDefinitionId: '00000000-0000-0000-0000-000000000042',
      currentStageCode: 'STROKE_SUBACUTE_EARLY',
      currentStageLabel: 'Early subacute stroke recovery (7-90 days)',
      determinationMethod: 'clinician_assessed' as const,
      confidence: 'HIGH' as const,
      dataQuality: 'verified' as const,
      provenance: mockProvenance,
    };

    const chronicStage = {
      ...subacuteStage,
      id: '00000000-0000-0000-0000-000000000043',
      currentStageCode: 'STROKE_CHRONIC_STABLE',
      currentStageLabel: 'Chronic post-stroke phase (>180 days)',
    };

    expect(() => validateDiseaseStageContextRules(subacuteStage)).not.toThrow();
    expect(() => validateDiseaseStageContextRules(chronicStage)).not.toThrow();
    expect(subacuteStage.currentStageCode).not.toEqual(chronicStage.currentStageCode);
  });

  // -------------------------------------------------------------------------
  // MI-06: Stroke aphasia (Language objective + treatment context snapshot)
  // -------------------------------------------------------------------------
  it('MI-06 — Stroke aphasia: enforces concurrent speech-language therapy context', () => {
    const treatmentEval = {
      treatmentContextSnapshotId: '00000000-0000-0000-0000-000000000060',
      requiredContextIds: ['REQ-SLT-CONCURRENT'],
      matchedContextIds: ['REQ-SLT-CONCURRENT'],
      applicability: 'full' as const,
      limitations: [],
      interpretation: 'Concurrent intensive speech-language therapy scheduled with TMS.',
    };

    expect(() => validateTargetTreatmentContextEvaluation(treatmentEval)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-07: Destroyed cortical target region (LesionTargetRelationship exclusion)
  // -------------------------------------------------------------------------
  it('MI-07 — Destroyed target region: records lesion destruction and excludes candidate', () => {
    const destroyedLesionRel = {
      lesionContextId: '00000000-0000-0000-0000-000000000070',
      targetRelationship: 'destroyed_or_absent' as const,
      minimumDistanceToLesionMm: 0,
      tissueIntegrity: 'severely_altered' as const,
      interpretation:
        'Candidate region lies completely within infarct cavitation. Target destroyed.',
    };

    expect(() => validateLesionTargetRelationship(destroyedLesionRel)).not.toThrow();
    expect(destroyedLesionRel.targetRelationship).toBe('destroyed_or_absent');
  });

  // -------------------------------------------------------------------------
  // MI-08: OCD deep TMS (Coil-field target rather than fictitious point)
  // -------------------------------------------------------------------------
  it('MI-08 — OCD deep TMS: represents coil-field geometry with coil model and field region', () => {
    const coilFieldGeometry = {
      geometryType: 'coil_field',
      coordinateSpace: defaultCoordSpace,
      laterality: 'bilateral',
      sourceMethod: 'efield_modelling_h7',
      sourceMethodVersion: '2.0.0',
      coilModelId: '00000000-0000-0000-0000-000000000081',
      placement: {
        placementCoordinateSystem: defaultCoordSpace,
        placementDescription: 'Medial prefrontal anterior cingulate placement (H7)',
      },
      intendedFieldRegion: {
        space: 'MNI152NLin2009cAsym',
        centerMni: { x: 0, y: 30, z: 36, space: 'MNI152NLin2009cAsym' },
        radiusMm: 15,
        description: 'dmPFC / dorsal anterior cingulate cortex field',
      },
      therapeuticRegionIds: ['00000000-0000-0000-0000-000000000082'],
      pointCoordinateIsRepresentativeOnly: true,
      provenance: mockProvenance,
    };

    expect(() => validateTargetGeometryRules(coilFieldGeometry, ['coil_field'])).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-09: TBI with skull defect (SkullContext + E-field modeling requirement)
  // -------------------------------------------------------------------------
  it('MI-09 — TBI with skull defect: records skull context with E-field requirement', () => {
    const lesionWithSkullDefect = {
      id: '00000000-0000-0000-0000-000000000090',
      version: '1.0.0',
      caseIndicationId: '00000000-0000-0000-0000-000000000091',
      lesionType: 'traumatic' as const,
      lesionLaterality: 'right' as const,
      sourceImagingStudyIds: ['00000000-0000-0000-0000-000000000092'],
      corticalRegionsAffected: [],
      subcorticalRegionsAffected: [],
      skullAbnormality: {
        skullDefectPresent: true,
        cranioplastyPresent: false,
        intracranialHardwarePresent: false,
        details: 'Right frontoparietal decompressive craniectomy bone defect.',
        efieldModellingRequired: true,
      },
      structuralDistortion: 'HIGH' as const,
      registrationQuality: 'moderate' as const,
      segmentationQuality: 'moderate' as const,
      efieldRelevance: 'material' as const,
      dataQuality: 'verified' as const,
      interpretation: 'Material bone defect alters current shunting; E-field modelling required.',
      provenance: mockProvenance,
    };

    expect(() => validateLesionContextRules(lesionWithSkullDefect)).not.toThrow();
    expect(lesionWithSkullDefect.skullAbnormality.efieldModellingRequired).toBe(true);
  });

  // -------------------------------------------------------------------------
  // MI-10: TBI cognitive research hypothesis (Research-only module)
  // -------------------------------------------------------------------------
  it('MI-10 — TBI research: enforces RESEARCH mode and blocks clinical slate', () => {
    const researchCandidate = {
      id: '00000000-0000-0000-0000-000000000100',
      version: '1.0.0',
      caseId: '00000000-0000-0000-0000-000000000001',
      caseIndicationId: '00000000-0000-0000-0000-000000000002',
      mode: 'RESEARCH' as const,
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000004',
      generationStatus: 'eligible' as const,
      candidateRole: 'research_hypothesis' as const,
      targetFamilyId: 'TF-TBI-DLPFC',
      therapeuticCircuitIds: ['CIRC-CC'],
      clinicalObjectiveIds: ['OBJ-TBI-COG'],
      targetGeometry: {
        geometryType: 'point' as const,
        coordinateSpace: defaultCoordSpace,
        laterality: 'left' as const,
        sourceMethod: 'research_exploratory',
        sourceMethodVersion: '1.0.0',
        centre: { x: -40, y: 35, z: 30 },
        provenance: mockProvenance,
      },
      atlasAnnotations: [],
      clinicalEvidence: {
        highestEvidenceTier: 'R' as const,
        indicationMatch: true,
        indicationModuleMatch: true,
        populationMatch: true,
        diseaseStageMatch: 'match' as const,
        targetFamilyMatch: true,
        targetingMethodMatch: true,
        targetGeometryMatch: true,
        evidenceClaimIds: ['CLAIM-TBI-01'],
        evidenceConfidence: 'LOW' as const,
        applicabilityLimitations: ['Investigational only'],
        evidenceSummary: 'Exploratory cognitive hypothesis.',
      },
      measurementBundleId: '00000000-0000-0000-0000-000000000005',
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      nominationRationale: 'Investigational research candidate.',
      counterarguments: [],
      supportingEvidenceClaimIds: [],
      conflictingEvidenceClaimIds: [],
      targetEngineVersionId: '2.0.0',
      evidenceLibraryReleaseId: 'EVD-2.0.0',
      provenance: mockProvenance,
      researchExtension: {
        experimentalHypothesisCode: 'TBI-COG-EXPLORATORY-01',
        explorativeConfidence: 0.45,
        notes: 'Strictly research mode.',
      },
    };

    expect(() => validateTargetCandidateRules(researchCandidate)).not.toThrow();

    // Clinical slate must reject this research candidate (§120)
    const clinicalSlate = {
      id: '00000000-0000-0000-0000-000000000101',
      version: '1.0.0',
      caseId: '00000000-0000-0000-0000-000000000001',
      caseIndicationId: '00000000-0000-0000-0000-000000000002',
      mode: 'CLINICAL' as const,
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000004',
      status: 'active' as const,
      generatedAt: '2026-09-03T00:00:00.000Z',
      phenotypeSnapshotId: '00000000-0000-0000-0000-000000000007',
      clinicalObjectiveIds: ['OBJ-TBI-COG'],
      measurementBundleId: '00000000-0000-0000-0000-000000000005',
      evidenceLibraryReleaseId: 'EVD-2.0.0',
      targetEngineVersionId: '2.0.0',
      pipelineVersionIds: ['PIPE-1'],
      primaryCandidates: [
        {
          targetCandidateId: researchCandidate.id,
          position: 'primary_1' as const,
          role: 'exploratory_investigational' as const,
          inclusionReason: 'Primary research hypothesis',
        },
      ],
      additionalCandidates: [],
      slateConvergence: { comparedSources: [], pairwiseRelationships: [] },
      clinicalCoverage: { objectives: [], redundancySummary: 'none' },
      generationSummary: 'Summary',
      scientificLimitations: [],
      payloadSha256: 'a'.repeat(64),
      provenance: mockProvenance,
    };

    expect(() => validateTargetSlateRules(clinicalSlate, [researchCandidate])).toThrow(
      DomainValidationError,
    );
  });

  // -------------------------------------------------------------------------
  // MI-11: Chronic tinnitus (Audiology context & research candidate)
  // -------------------------------------------------------------------------
  it('MI-11 — Tinnitus research: represents audiology measurements and research targets', () => {
    const audiologyBundle = {
      id: '00000000-0000-0000-0000-000000000110',
      version: '1.0.0',
      caseId: '00000000-0000-0000-0000-000000000001',
      caseIndicationId: '00000000-0000-0000-0000-000000000002',
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
      phenotypeSnapshotId: '00000000-0000-0000-0000-000000000007',
      qualificationStatus: 'qualified' as const,
      measurements: [
        {
          measurementId: '00000000-0000-0000-0000-000000000111',
          modality: 'audiology' as const,
          version: '1.0.0',
          status: 'qualified' as const,
        },
      ],
      requirementEvaluations: [
        {
          requirementCode: 'REQ-AUDIOLOGY',
          satisfied: true,
          satisfyingMeasurementIds: ['00000000-0000-0000-0000-000000000111'],
          resultingCapability: 'enabled' as const,
          explanation: 'Pitch and loudness matching completed.',
        },
      ],
      limitingFactors: [],
      createdAt: '2026-09-03T00:00:00.000Z',
      payloadSha256: 'b'.repeat(64),
      provenance: mockProvenance,
    };

    expect(() => validateMeasurementBundleRules(audiologyBundle)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-12: MDD + Pain comorbidity (Two distinct CaseIndications & Slates)
  // -------------------------------------------------------------------------
  it('MI-12 — MDD + Pain comorbidity: keeps separate slates and supports cross-indication review', () => {
    const crossReview = {
      id: '00000000-0000-0000-0000-000000000120',
      caseId: '00000000-0000-0000-0000-000000000001',
      targetSlateIds: [
        '00000000-0000-0000-0000-000000000121',
        '00000000-0000-0000-0000-000000000122',
      ],
      spatialRelationships: [
        {
          candidateIdA: 'CAND-MDD-LDLPFC',
          candidateIdB: 'CAND-PAIN-M1',
          distanceMm: 48.5,
          relationship: 'remote' as const,
          interpretation: 'Target sites in distinct prefrontal and motor cortices.',
        },
      ],
      overlappingTargetFamilyIds: [],
      conflictingObjectives: [],
      summary: 'Dual indication evaluation: independent MDD and pain targeting slates.',
      mode: 'CLINICAL' as const,
      provenance: mockProvenance,
    };

    expect(() => validateCrossIndicationTargetReview(crossReview)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // MI-13: Missing optional measurement (Graceful fallback)
  // -------------------------------------------------------------------------
  it('MI-13 — Missing optional measurement: permits graceful evidence-supported fallback', () => {
    const fallbackBundle = {
      id: '00000000-0000-0000-0000-000000000130',
      version: '1.0.0',
      caseId: '00000000-0000-0000-0000-000000000001',
      caseIndicationId: '00000000-0000-0000-0000-000000000002',
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
      phenotypeSnapshotId: '00000000-0000-0000-0000-000000000007',
      qualificationStatus: 'qualified_with_limits' as const,
      measurements: [
        {
          measurementId: '00000000-0000-0000-0000-000000000131',
          modality: 'structural_mri' as const,
          version: '1.0.0',
          status: 'qualified' as const,
        },
      ],
      requirementEvaluations: [
        {
          requirementCode: 'REQ-RS-FMRI-REFINED',
          satisfied: false,
          satisfyingMeasurementIds: [],
          resultingCapability: 'fallback_only' as const,
          explanation: 'Resting state fMRI absent; fallback to population coordinates enabled.',
        },
      ],
      limitingFactors: ['Resting-state fMRI unavailable.'],
      createdAt: '2026-09-03T00:00:00.000Z',
      payloadSha256: 'c'.repeat(64),
      provenance: mockProvenance,
    };

    expect(() => validateMeasurementBundleRules(fallbackBundle)).not.toThrow();
    expect(fallbackBundle.requirementEvaluations[0]?.resultingCapability).toBe('fallback_only');
  });

  // -------------------------------------------------------------------------
  // MI-14: Missing mandatory measurement (Complete abstention)
  // -------------------------------------------------------------------------
  it('MI-14 — Missing mandatory measurement: enforces complete slate abstention', () => {
    const abstainedSlate = {
      id: '00000000-0000-0000-0000-000000000140',
      version: '1.0.0',
      caseId: '00000000-0000-0000-0000-000000000001',
      caseIndicationId: '00000000-0000-0000-0000-000000000002',
      mode: 'CLINICAL' as const,
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000004',
      status: 'abstained' as const,
      generatedAt: '2026-09-03T00:00:00.000Z',
      phenotypeSnapshotId: '00000000-0000-0000-0000-000000000007',
      clinicalObjectiveIds: ['OBJ-01'],
      measurementBundleId: '00000000-0000-0000-0000-000000000005',
      evidenceLibraryReleaseId: 'EVD-2.0.0',
      targetEngineVersionId: '2.0.0',
      pipelineVersionIds: [],
      primaryCandidates: [],
      additionalCandidates: [],
      slateConvergence: {
        comparedSources: [],
        pairwiseRelationships: [],
        overall: 'not_assessable' as const,
        interpretation: 'Abstained',
      },
      clinicalCoverage: { objectives: [], redundancySummary: 'none' },
      abstention: {
        abstentionType: 'measurement_failure' as const,
        reasonCodes: ['MANDATORY_T1W_ABSENT'],
        explanation: 'Structural MRI is mandatory for anatomical safety and targeting.',
        fallbackOptions: ['Acquire T1w MRI before target generation.'],
      },
      generationSummary: 'Abstained due to missing structural MRI.',
      scientificLimitations: ['No valid candidates could be generated.'],
      payloadSha256: 'd'.repeat(64),
      provenance: mockProvenance,
    };

    expect(() => validateTargetSlateRules(abstainedSlate)).not.toThrow();
    expect(abstainedSlate.status).toBe('abstained');
    expect(abstainedSlate.primaryCandidates.length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // MI-15: Module upgrade after historical decision (Immutability & Pinning)
  // -------------------------------------------------------------------------
  it('MI-15 — Module upgrade: pins historical slate and requires new analysis for new version', () => {
    const historicalSlate = {
      indicationModuleReleaseId: 'MODULE-STROKE-1.0.0',
      generatedAt: '2026-08-01T00:00:00.000Z',
    };

    const activeRelease = {
      id: 'MODULE-STROKE-1.1.0',
    };

    const result = validateModuleVersionIntegrity(historicalSlate, activeRelease);
    expect(result.status).toBe('historical_pinned');
    expect(result.requiresNewSlateAnalysis).toBe(true);
    expect(result.originalModuleReleaseId).toBe('MODULE-STROKE-1.0.0');
  });

  // -------------------------------------------------------------------------
  // §121: Cross-Case Integrity Rule
  // -------------------------------------------------------------------------
  it('§121 — Cross-Case Integrity: rejects mixing objects from different cases', () => {
    const caseAObjects = [
      { caseId: '00000000-0000-0000-0000-000000000001' },
      { caseId: '00000000-0000-0000-0000-000000000001' },
    ];
    expect(() => validateCrossCaseIntegrity(caseAObjects)).not.toThrow();

    const mixedObjects = [
      { caseId: '00000000-0000-0000-0000-000000000001' },
      { caseId: '00000000-0000-0000-0000-000000000002' }, // Cross-case leakage
    ];
    expect(() => validateCrossCaseIntegrity(mixedObjects)).toThrow(DomainValidationError);
  });

  // -------------------------------------------------------------------------
  // §122: Cross-Indication Integrity Rule
  // -------------------------------------------------------------------------
  it('§122 — Cross-Indication Integrity: rejects inserting candidates from another module', () => {
    const slate = { indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001' };
    const candidates = [
      { id: 'C1', indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001' },
      { id: 'C2', indicationModuleReleaseId: '00000000-0000-0000-0000-000000000002' }, // Cross-indication leakage
    ];

    expect(() => validateCrossIndicationIntegrity(slate, candidates)).toThrow(
      DomainValidationError,
    );
  });

  // -------------------------------------------------------------------------
  // §96: Clinician Modified Target
  // -------------------------------------------------------------------------
  it('§96 — Clinician Modified Target: validates explicit modification provenance', () => {
    const modifiedTarget = {
      sourceTargetCandidateId: '00000000-0000-0000-0000-000000000001',
      modifiedGeometry: {
        geometryType: 'point' as const,
        coordinateSpace: defaultCoordSpace,
        laterality: 'left' as const,
        sourceMethod: 'clinician_manual_refinement',
        sourceMethodVersion: '1.0.0',
        centre: { x: -42, y: 38, z: 30 },
        provenance: mockProvenance,
      },
      modificationDistanceMm: 2.8,
      modificationReason: 'Adjusted posteriorly to avoid sulcal fundus based on visual inspection.',
      createdBy: 'clinician-dr-smith',
      createdAt: '2026-09-03T12:00:00.000Z',
    };

    expect(() => validateClinicianModifiedTarget(modifiedTarget)).not.toThrow();
  });
});
