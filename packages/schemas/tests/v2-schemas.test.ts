import { describe, it, expect } from 'vitest';
import {
  validateIndicationModuleRelease,
  validateCaseIndication,
  validateDiseaseStageContext,
  validateLesionContext,
  validateMeasurementBundle,
  validateReliabilityBundle,
  validateTreatmentContextSnapshot,
  validateTargetGeometry,
  validateEvidenceGovernanceClassification,
  validateEvidencePathV2,
  validateScientificCompatibilityConfiguration,
  validateTargetCandidateV2,
  validateTargetSlateV2,
  DomainValidationError,
} from '../src/index.js';

describe('Phase 1 — Canonical v2 Zod Schemas & Validators', () => {
  const mockProvenance = {
    createdBy: 'system-validator',
    createdAt: '2026-09-03T00:00:00.000Z',
    softwareVersion: '2.0.0',
  };

  it('1. should validate valid IndicationModuleRelease and reject invalid qualification level', () => {
    const validModule = {
      id: '11111111-1111-1111-1111-111111111111',
      code: 'MAGNIOM-IND-STROKE-MOTOR',
      semanticVersion: '1.0.0',
      title: 'Stroke Motor Rehab',
      description: 'Cortical motor mapping',
      indication: { conceptId: 'IND-STROKE', label: 'Stroke' },
      lifecycleStatus: 'active',
      moduleStatus: 'clinical_active',
      qualificationLevel: 'Q4',
      permittedModes: ['CLINICAL'],
      intendedPopulation: {
        code: 'POP-ADULT',
        label: 'Adults',
        description: 'Adult stroke patients',
      },
      phenotypeSchemaVersionId: 'PHE-1.0',
      clinicalObjectiveDefinitionIds: ['OBJ-01'],
      evidenceScopeId: 'EVD-01',
      permittedTargetFamilyIds: ['TF-M1'],
      permittedCandidateGenerationMethodIds: ['GEN-01'],
      measurementRequirements: [
        {
          code: 'REQ-STRUCTURAL',
          modality: 'structural_mri',
          requirement: 'required',
          purpose: 'anatomical_localisation',
          missingDataBehaviour: 'block_target_generation',
          rationale: 'Required scan',
        },
      ],
      reliabilityPolicyRefs: ['POL-01'],
      permittedTargetGeometryTypes: ['somatotopic', 'point'],
      scientificPolicyCompatibilityRefs: ['POL-COMPAT-01'],
      knownLimitations: [],
      validationEvidenceIds: ['VAL-01'],
      payloadSha256: 'a'.repeat(64),
      manifestSha256: 'b'.repeat(64),
      createdAt: '2026-09-03T00:00:00.000Z',
      provenance: mockProvenance,
    };

    expect(() => validateIndicationModuleRelease(validModule)).not.toThrow();

    const invalidModule = { ...validModule, qualificationLevel: 'Q9_INVALID' };
    expect(() => validateIndicationModuleRelease(invalidModule)).toThrow(DomainValidationError);
  });

  it('2. should validate CaseIndication and reject invalid status', () => {
    const validCaseIndication = {
      id: '22222222-2222-2222-2222-222222222222',
      version: '1.0.0',
      caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      indication: { conceptId: 'IND-STROKE', label: 'Stroke' },
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      status: 'confirmed',
      clinicalRole: 'primary_targeting_indication',
      confirmationSourceIds: ['source-01'],
      dataQuality: 'verified',
      provenance: mockProvenance,
    };

    expect(() => validateCaseIndication(validCaseIndication)).not.toThrow();

    const invalid = { ...validCaseIndication, status: 'unknown_status' };
    expect(() => validateCaseIndication(invalid)).toThrow(DomainValidationError);
  });

  it('3. should validate DiseaseStageContext and check date-based determination', () => {
    const validStage = {
      id: '33333333-3333-3333-3333-333333333333',
      version: '1.0.0',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      stageDefinitionId: '33333333-3333-3333-3333-333333333334',
      onsetDate: '2026-06-01',
      calculatedDurationDays: 90,
      currentStageCode: 'SUBACUTE',
      currentStageLabel: 'Subacute',
      determinationMethod: 'date_based',
      confidence: 'HIGH',
      dataQuality: 'verified',
      provenance: mockProvenance,
    };

    expect(() => validateDiseaseStageContext(validStage)).not.toThrow();
  });

  it('4. should validate LesionContext and enforce laterality enumeration', () => {
    const validLesion = {
      id: '44444444-4444-4444-4444-444444444444',
      version: '1.0.0',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      lesionType: 'ischemic',
      lesionLaterality: 'left',
      sourceImagingStudyIds: ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
      lesionVolumeCm3: 12.4,
      corticalRegionsAffected: [
        { atlasName: 'HCP', atlasVersion: '1.0', space: 'MNI152NLin2009cAsym' },
      ],
      subcorticalRegionsAffected: [],
      structuralDistortion: 'MODERATE',
      registrationQuality: 'high',
      segmentationQuality: 'high',
      efieldRelevance: 'material',
      dataQuality: 'reviewed',
      interpretation: 'Cortical stroke',
      provenance: mockProvenance,
    };

    expect(() => validateLesionContext(validLesion)).not.toThrow();
  });

  it('5. should validate MeasurementBundle and reject non-64-char SHA256', () => {
    const validBundle = {
      id: 'mb-01',
      version: '1.0.0',
      caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      caseIndicationId: '22222222-2222-2222-2222-222222222222',
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      phenotypeSnapshotId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      measurements: [
        {
          measurementId: 'mri-01',
          modality: 'structural_mri',
          version: '1.0.0',
          status: 'qualified',
        },
      ],
      qualificationStatus: 'qualified',
      requirementEvaluations: [
        {
          requirementCode: 'REQ-MRI',
          satisfied: true,
          satisfyingMeasurementIds: ['mri-01'],
          resultingCapability: 'enabled',
          explanation: 'Scan verified',
        },
      ],
      limitingFactors: [],
      createdAt: '2026-09-03T00:00:00.000Z',
      payloadSha256: 'a'.repeat(64),
      provenance: mockProvenance,
    };

    expect(() => validateMeasurementBundle(validBundle)).not.toThrow();

    const invalidHash = { ...validBundle, payloadSha256: 'short-hash' };
    expect(() => validateMeasurementBundle(invalidHash)).toThrow(DomainValidationError);
  });

  it('6. should validate TargetGeometry discriminated union across types', () => {
    const validPoint = {
      geometryType: 'point',
      coordinateSpace: { id: 'MNI', name: 'MNI152NLin2009cAsym', subjectSpecific: false },
      laterality: 'left',
      sourceMethod: 'method-01',
      sourceMethodVersion: '1.0',
      centre: { x: -38, y: 44, z: 26 },
      provenance: mockProvenance,
    };

    const validSomato = {
      geometryType: 'somatotopic',
      coordinateSpace: { id: 'MNI', name: 'MNI152NLin2009cAsym', subjectSpecific: false },
      laterality: 'left',
      sourceMethod: 'mapping-01',
      sourceMethodVersion: '1.0',
      corticalRegion: { atlasName: 'HCP', atlasVersion: '1.0', space: 'MNI152NLin2009cAsym' },
      bodyRegion: { code: 'HAND_R', label: 'Right Hand' },
      stimulationHemisphere: 'left',
      provenance: mockProvenance,
    };

    expect(() => validateTargetGeometry(validPoint)).not.toThrow();
    expect(() => validateTargetGeometry(validSomato)).not.toThrow();

    const invalidType = { ...validPoint, geometryType: 'invalid_shape' };
    expect(() => validateTargetGeometry(invalidType)).toThrow(DomainValidationError);
  });

  it('7. should validate EvidenceGovernanceClassification and EvidencePath', () => {
    const validGov = {
      id: 'gov-01',
      evidenceClaimId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      claimVersion: '1.0.0',
      classificationStatus: 'assigned',
      magniomEvidenceTier: 'A',
      permittedRoles: {
        standalonePrimary: true,
        standaloneAdditional: true,
        supportingContext: true,
        refinementOfParentClaims: true,
        researchCandidateGeneration: true,
      },
      reviewerIds: ['rev-01'],
      provenance: mockProvenance,
    };

    expect(() => validateEvidenceGovernanceClassification(validGov)).not.toThrow();

    const validPath = {
      id: 'path-01',
      indicationModuleReleaseId: '11111111-1111-1111-1111-111111111111',
      evidenceClaimIds: ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
      populationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      clinicalObjectiveId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      targetFamilyId: 'TF-01',
      targetingStrategyId: 'STRAT-01',
      targetGeometryType: 'point',
      governanceClassificationIds: ['gov-01'],
      pathStatus: 'clinical_permitted',
      provenance: mockProvenance,
    };

    expect(() => validateEvidencePathV2(validPath)).not.toThrow();
  });
});
