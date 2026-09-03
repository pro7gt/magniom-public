import { describe, it, expect } from 'vitest';
import type {
  IndicationModuleRelease,
  CaseIndication,
  DiseaseStageContext,
  LesionContext,
  MeasurementBundle,
  ReliabilityBundle,
  TreatmentContextSnapshot,
  TargetGeometry,
  PointTargetGeometry,
  SurfaceROITargetGeometry,
  VolumetricROITargetGeometry,
  SomatotopicTargetGeometry,
  CoilFieldTargetGeometry,
  NetworkTargetGeometry,
  EvidencePath,
  EvidenceGovernanceClassification,
  ScientificCompatibilityConfiguration,
} from '../src/index.js';

describe('Phase 1 — Canonical v2 Domain Objects Conformance', () => {
  const mockProvenance = {
    createdBy: 'specialist-clinician-001',
    createdAt: '2026-09-03T00:00:00.000Z',
    softwareVersion: '2.0.0',
  };

  it('1. should instantiate canonical IndicationModuleRelease', () => {
    const moduleRelease: IndicationModuleRelease = {
      id: '11111111-1111-1111-1111-111111111111',
      code: 'MAGNIOM-IND-STROKE-MOTOR',
      semanticVersion: '1.0.0',
      title: 'Stroke — Motor Rehabilitation Module',
      description: 'Cortical motor mapping and ipsilesional/contralesional targeting',
      indication: {
        conceptId: 'IND-STROKE-MOTOR',
        label: 'Stroke with Upper-Limb Motor Impairment',
        codingSystem: 'ICD-10',
        code: 'I69.3',
      },
      lifecycleStatus: 'active',
      moduleStatus: 'clinical_active',
      qualificationLevel: 'Q4',
      permittedModes: ['CLINICAL', 'RESEARCH'],
      intendedPopulation: {
        code: 'POP-STROKE-ADULT',
        label: 'Adult post-stroke hemiparesis',
        description: 'Adult patients >18 years with unilateral ischemic stroke >30 days',
        minAgeYears: 18,
      },
      phenotypeSchemaVersionId: 'PHE-STROKE-1.0',
      clinicalObjectiveDefinitionIds: ['OBJ-UPPER-LIMB-MOTOR'],
      diseaseStageDefinitionIds: ['STAGE-SUBACUTE', 'STAGE-CHRONIC'],
      evidenceScopeId: 'EVD-STROKE-MOTOR-V1',
      permittedTargetFamilyIds: ['TF-M1-HAND', 'TF-PREMOTOR-DORSAL'],
      permittedCandidateGenerationMethodIds: ['GEN-MOTOR-MAP-HOTSPOT', 'GEN-CONTRALESIONAL-M1'],
      measurementRequirements: [
        {
          code: 'REQ-STRUCTURAL-T1',
          modality: 'structural_mri',
          requirement: 'required',
          purpose: 'anatomical_localisation',
          missingDataBehaviour: 'block_target_generation',
          rationale: 'Mandatory structural scan for lesion localisation',
        },
      ],
      reliabilityPolicyRefs: ['POL-REL-MOTOR-01'],
      permittedTargetGeometryTypes: ['somatotopic', 'point', 'surface_roi'],
      scientificPolicyCompatibilityRefs: ['POL-STROKE-2026-V1'],
      knownLimitations: ['Severely altered subcortical white-matter may preclude mapping'],
      validationEvidenceIds: ['VAL-STUDY-STR-01'],
      payloadSha256: 'a'.repeat(64),
      manifestSha256: 'b'.repeat(64),
      createdAt: '2026-09-03T00:00:00.000Z',
      provenance: mockProvenance,
    };

    expect(moduleRelease.code).toBe('MAGNIOM-IND-STROKE-MOTOR');
    expect(moduleRelease.qualificationLevel).toBe('Q4');
    expect(moduleRelease.permittedTargetGeometryTypes).toContain('somatotopic');
  });

  it('2. should instantiate canonical CaseIndication', () => {
    const caseIndication: CaseIndication = {
      id: '22222222-2222-2222-2222-222222222222',
      version: '1.0.0',
      caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      indication: {
        conceptId: 'IND-STROKE-MOTOR',
        label: 'Stroke Motor Rehab',
      },
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      status: 'confirmed',
      clinicalRole: 'primary_targeting_indication',
      confirmationSourceIds: ['doc-eval-001'],
      dataQuality: 'verified',
      provenance: mockProvenance,
    };

    expect(caseIndication.clinicalRole).toBe('primary_targeting_indication');
    expect(caseIndication.status).toBe('confirmed');
  });

  it('3. should instantiate canonical DiseaseStageContext', () => {
    const stageContext: DiseaseStageContext = {
      id: '33333333-3333-3333-3333-333333333333',
      version: '1.0.0',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      stageDefinitionId: 'STAGE-SUBACUTE-DEF',
      onsetDate: '2026-06-01',
      calculatedDurationDays: 94,
      currentStageCode: 'SUBACUTE',
      currentStageLabel: 'Subacute Recovery Stage',
      determinationMethod: 'date_based',
      confidence: 'HIGH',
      dataQuality: 'verified',
      provenance: mockProvenance,
    };

    expect(stageContext.calculatedDurationDays).toBe(94);
    expect(stageContext.determinationMethod).toBe('date_based');
  });

  it('4. should instantiate canonical LesionContext', () => {
    const lesionContext: LesionContext = {
      id: '44444444-4444-4444-4444-444444444444',
      version: '1.0.0',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      lesionType: 'ischemic',
      lesionLaterality: 'left',
      sourceImagingStudyIds: ['study-mri-001'],
      lesionVolumeCm3: 18.5,
      corticalRegionsAffected: [
        { atlasName: 'HCP_MMP1.0', atlasVersion: '1.0', space: 'MNI152NLin2009cAsym' },
      ],
      subcorticalRegionsAffected: [],
      structuralDistortion: 'MODERATE',
      registrationQuality: 'high',
      segmentationQuality: 'high',
      efieldRelevance: 'material',
      dataQuality: 'reviewed',
      interpretation: 'Left MCA territory cortical infarct sparing primary motor hand knob',
      provenance: mockProvenance,
    };

    expect(lesionContext.lesionLaterality).toBe('left');
    expect(lesionContext.efieldRelevance).toBe('material');
  });

  it('5. should instantiate canonical MeasurementBundle', () => {
    const measurementBundle: MeasurementBundle = {
      id: 'mb-001',
      version: '1.0.0',
      caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      phenotypeSnapshotId: 'snap-001',
      measurements: [
        {
          measurementId: 'mri-001',
          modality: 'structural_mri',
          version: '1.0.0',
          status: 'qualified',
        },
        {
          measurementId: 'map-001',
          modality: 'motor_mapping',
          version: '1.0.0',
          status: 'qualified',
        },
      ],
      qualificationStatus: 'qualified',
      requirementEvaluations: [
        {
          requirementCode: 'REQ-STRUCTURAL-T1',
          satisfied: true,
          satisfyingMeasurementIds: ['mri-001'],
          resultingCapability: 'enabled',
          explanation: 'Structural scan verified',
        },
      ],
      limitingFactors: [],
      createdAt: '2026-09-03T00:00:00.000Z',
      payloadSha256: 'c'.repeat(64),
      provenance: mockProvenance,
    };

    expect(measurementBundle.measurements).toHaveLength(2);
    expect(measurementBundle.qualificationStatus).toBe('qualified');
  });

  it('6. should instantiate canonical ReliabilityBundle', () => {
    const reliabilityBundle: ReliabilityBundle = {
      id: 'rel-bundle-001',
      version: '1.0.0',
      caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      measurementBundleId: 'mb-001',
      componentReliabilityIds: ['rel-map-001'],
      capabilityQualification: [
        {
          capabilityCode: 'motor_hotspot_targeting',
          status: 'qualified',
          reliedOnMeasurementIds: ['map-001'],
          reliedOnReliabilityIds: ['rel-map-001'],
          policyRuleId: 'RULE-MOTOR-01',
          explanation: 'Reproducible FDI hotspot across runs',
        },
      ],
      overallQualification: 'qualified',
      limitingFactors: [],
      interpretation: 'Motor mapping reproducibility meets clinical threshold',
      payloadSha256: 'd'.repeat(64),
      provenance: mockProvenance,
    };

    expect(reliabilityBundle.capabilityQualification[0]?.capabilityCode).toBe(
      'motor_hotspot_targeting',
    );
    expect(reliabilityBundle.overallQualification).toBe('qualified');
  });

  it('7. should instantiate canonical TreatmentContextSnapshot', () => {
    const treatmentContext: TreatmentContextSnapshot = {
      id: '55555555-5555-5555-5555-555555555555',
      version: '1.0.0',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      requirementEvaluations: [
        {
          treatmentContextRequirementId: 'REQ-CONCURRENT-PT',
          status: 'present',
          evidence: 'Active physical therapy program 45min post-TMS',
          dataQuality: 'verified',
        },
      ],
      approvedBy: 'clinician-001',
      approvedAt: '2026-09-03T00:00:00.000Z',
      payloadSha256: 'e'.repeat(64),
      provenance: mockProvenance,
    };

    expect(treatmentContext.requirementEvaluations[0]?.status).toBe('present');
  });

  it('8. should instantiate all 6 TargetGeometry modalities through discriminated union', () => {
    const pointGeo: PointTargetGeometry = {
      geometryType: 'point',
      coordinateSpace: { id: 'MNI', name: 'MNI152NLin2009cAsym', subjectSpecific: false },
      laterality: 'left',
      sourceMethod: 'hotspot_centroid',
      sourceMethodVersion: '1.0',
      centre: { x: -38, y: -22, z: 56 },
      provenance: mockProvenance,
    };

    const somatoGeo: SomatotopicTargetGeometry = {
      geometryType: 'somatotopic',
      coordinateSpace: { id: 'MNI', name: 'MNI152NLin2009cAsym', subjectSpecific: false },
      laterality: 'left',
      sourceMethod: 'tms_mapping',
      sourceMethodVersion: '1.0',
      corticalRegion: {
        atlasName: 'HCP_MMP1.0',
        atlasVersion: '1.0',
        space: 'MNI152NLin2009cAsym',
      },
      bodyRegion: { code: 'HAND_RIGHT', label: 'Right Hand FDI' },
      stimulationHemisphere: 'left',
      mappedHotspot: { x: -38, y: -22, z: 56 },
      provenance: mockProvenance,
    };

    const coilGeo: CoilFieldTargetGeometry = {
      geometryType: 'coil_field',
      coordinateSpace: { id: 'NATIVE', name: 'NATIVE_T1W', subjectSpecific: true },
      laterality: 'midline',
      sourceMethod: 'efield_simulation',
      sourceMethodVersion: '2.1',
      coilModelId: 'H7-COIL-001',
      placement: {
        scalpCoordinate: { x: 0, y: 35, z: 70 },
        orientationDegrees: 90,
        placementCoordinateSystem: { id: 'NATIVE', name: 'NATIVE_T1W', subjectSpecific: true },
      },
      intendedFieldRegion: {
        regionId: 'DMPFC-ACC',
        name: 'DMPFC/ACC Target Volume',
        space: 'NATIVE',
      },
      therapeuticRegionIds: ['ACC-01', 'DMPFC-01'],
      pointCoordinateIsRepresentativeOnly: true,
      provenance: mockProvenance,
    };

    const surfaceGeo: SurfaceROITargetGeometry = {
      geometryType: 'surface_roi',
      coordinateSpace: { id: 'fsLR_32k', name: 'fsLR_32k', subjectSpecific: false },
      laterality: 'left',
      sourceMethod: 'cortical_parcellation',
      sourceMethodVersion: '1.0',
      surfaceId: 'surf-lh-pial',
      areaMm2: 142.5,
      provenance: mockProvenance,
    };

    const volGeo: VolumetricROITargetGeometry = {
      geometryType: 'volumetric_roi',
      coordinateSpace: { id: 'MNI', name: 'MNI152NLin2009cAsym', subjectSpecific: false },
      laterality: 'right',
      sourceMethod: 'subcortical_mask',
      sourceMethodVersion: '1.0',
      maskArtifactId: 'art-mask-001',
      volumeMm3: 450.0,
      provenance: mockProvenance,
    };

    const netGeo: NetworkTargetGeometry = {
      geometryType: 'network',
      coordinateSpace: { id: 'MNI', name: 'MNI152NLin2009cAsym', subjectSpecific: false },
      laterality: 'bilateral',
      sourceMethod: 'circuit_library',
      sourceMethodVersion: '2.0',
      therapeuticCircuitIds: ['TC-MDD-001'],
      accessibleNodeRegions: [{ regionId: 'DLPFC', name: 'DLPFC Node', space: 'MNI' }],
      networkDefinitionVersionId: 'NET-DEF-01',
      provenance: mockProvenance,
    };

    const geometries: TargetGeometry[] = [pointGeo, somatoGeo, coilGeo, surfaceGeo, volGeo, netGeo];
    expect(geometries).toHaveLength(6);
    expect(geometries.map(g => g.geometryType)).toEqual([
      'point',
      'somatotopic',
      'coil_field',
      'surface_roi',
      'volumetric_roi',
      'network',
    ]);
  });

  it('9. should instantiate canonical EvidencePath', () => {
    const evidencePath: EvidencePath = {
      id: 'path-stroke-m1-01',
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      evidenceClaimIds: ['claim-m1-recovery-01'],
      populationId: 'POP-STROKE-ADULT',
      clinicalObjectiveId: 'OBJ-UPPER-LIMB-MOTOR',
      diseaseStageId: 'STAGE-SUBACUTE',
      targetFamilyId: 'TF-M1-HAND',
      targetingStrategyId: 'STRAT-IPSILESIONAL-M1',
      targetGeometryType: 'somatotopic',
      governanceClassificationIds: ['gov-claim-m1-01'],
      pathStatus: 'clinical_permitted',
      provenance: mockProvenance,
    };

    expect(evidencePath.pathStatus).toBe('clinical_permitted');
    expect(evidencePath.targetGeometryType).toBe('somatotopic');
  });

  it('10. should instantiate canonical EvidenceGovernanceClassification', () => {
    const classification: EvidenceGovernanceClassification = {
      id: 'gov-001',
      evidenceClaimId: 'claim-m1-recovery-01',
      claimVersion: '1.0.0',
      classificationStatus: 'assigned',
      magniomEvidenceTier: 'A',
      permittedRoles: {
        standalonePrimary: true,
        standaloneAdditional: true,
        supportingContext: true,
        refinementOfParentClaims: false,
        researchCandidateGeneration: true,
      },
      reviewerIds: ['expert-reviewer-01'],
      rationale: 'Double-blind sham-controlled RCT precedent in subacute stroke motor rehab',
      assignedAt: '2026-09-03T00:00:00.000Z',
      provenance: mockProvenance,
    };

    expect(classification.magniomEvidenceTier).toBe('A');
    expect(classification.permittedRoles?.standalonePrimary).toBe(true);
  });

  it('11. should instantiate canonical ScientificCompatibilityConfiguration', () => {
    const compatibilityConfig: ScientificCompatibilityConfiguration = {
      id: 'compat-stroke-2026-v1',
      code: 'CFG-STROKE-MOTOR-CLINICAL',
      version: '1.0.0',
      scientificPolicyReleaseId: 'pol-stroke-01',
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      mode: 'CLINICAL',
      evidenceLibraryReleaseId: 'evd-lib-01',
      targetEngineReleaseId: 'engine-2.0.0',
      targetingPlugin: {
        componentType: 'targeting_plugin',
        componentId: 'plugin-stroke-motor',
        componentVersion: '1.0.0',
      },
      candidateGenerators: [
        {
          componentType: 'candidate_generator',
          componentId: 'gen-ipsilesional-m1',
          componentVersion: '1.0.0',
        },
      ],
      measurementProviders: [
        {
          componentType: 'measurement_provider',
          requirement: 'required',
          purpose: 'anatomical_localisation',
        },
      ],
      reliabilityMethods: [
        {
          componentType: 'reliability_method',
          requirement: 'required',
          purpose: 'motor_hotspot_reproducibility',
        },
      ],
      phenotypeOntologyReleaseId: 'onto-stroke-01',
      atlasReleases: [],
      normativeModels: [],
      deviceCapabilityProfiles: [],
      acquisitionProfiles: [],
      compatibilityStatus: 'validated',
      validationEvidenceIds: ['VAL-COMPAT-01'],
      configurationSha256: 'f'.repeat(64),
    };

    expect(compatibilityConfig.mode).toBe('CLINICAL');
    expect(compatibilityConfig.compatibilityStatus).toBe('validated');
  });
});
