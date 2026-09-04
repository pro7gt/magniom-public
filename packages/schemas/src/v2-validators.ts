/**
 * MAGNIOM Canonical Domain Validation Functions v2.0
 * Provides typed validation wrappers and domain invariant enforcement
 */

import { z } from 'zod';
import {
  IndicationModuleSchema,
  IndicationModuleReleaseSchema,
  IndicationTargetingContextSchema,
  IndicationPhenotypeExtensionSchema,
  CaseIndicationSchema,
  DiseaseStageContextSchema,
  LesionContextSchema,
  MeasurementBundleSchema,
  ReliabilityBundleSchema,
  TreatmentContextSnapshotSchema,
  TargetGeometrySchema,
  EvidenceGovernanceClassificationSchema,
  EvidencePathV2Schema,
  ScientificCompatibilityConfigurationSchema,
  TargetCandidateV2Schema,
  TargetSlateV2Schema,
  ProcessingRunSchema,
  StructuralMeasurementSchema,
  LesionMeasurementSchema,
  RestingStateMeasurementSchema,
  TaskFMRIMeasurementSchema,
  DiffusionMeasurementSchema,
  MotorMappingMeasurementSchema,
  MEPMeasurementSchema,
  AudiologyMeasurementSchema,
  EFieldMeasurementSchema,
  TransformGraphSchema,
  EvidenceClaimV2Schema,
  SourceFindingSchema,
  ClaimEvidenceSynthesisSchema,
  EvidenceLibraryReleaseV2Schema,
  LesionTargetRelationshipSchema,
  MotorMappingFitProfileSchema,
  StructuralConnectivityFitProfileSchema,
  TargetTreatmentContextEvaluationSchema,
  ResearchTargetExtensionSchema,
  CrossIndicationTargetReviewSchema,
  ClinicianModifiedTargetSchema,
  TargetEngineInputV2Schema,
  CanonicalTargetEngineOutputManifestV2Schema,
  TargetFamilyV2Schema,
  TherapeuticCircuitV2Schema,
  ClaimTargetBindingSchema,
  EvidenceEdgeSchema,
  PROHIBITED_CANONICAL_FIELDS,
  AcquisitionProfileSchema,
  ScientificPolicyReleaseV2Schema,
  IndicationPolicyBindingSchema,
  ScientificImpactReportSchema,
} from './v2-schemas.js';

export class DomainValidationError extends Error {
  public readonly issues: readonly z.ZodIssue[];

  constructor(message: string, issues: readonly z.ZodIssue[]) {
    super(message);
    this.name = 'DomainValidationError';
    this.issues = issues;
  }
}

export function validateIndicationModule(data: unknown) {
  const result = IndicationModuleSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `IndicationModule validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateIndicationTargetingContext(data: unknown) {
  const result = IndicationTargetingContextSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `IndicationTargetingContext validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateIndicationPhenotypeExtension(data: unknown) {
  const result = IndicationPhenotypeExtensionSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `IndicationPhenotypeExtension validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateIndicationModuleRelease(data: unknown) {
  const result = IndicationModuleReleaseSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `IndicationModuleRelease validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateCaseIndication(data: unknown) {
  const result = CaseIndicationSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `CaseIndication validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateDiseaseStageContext(data: unknown) {
  const result = DiseaseStageContextSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `DiseaseStageContext validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateLesionContext(data: unknown) {
  const result = LesionContextSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `LesionContext validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateMeasurementBundle(data: unknown) {
  const result = MeasurementBundleSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `MeasurementBundle validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateReliabilityBundle(data: unknown) {
  const result = ReliabilityBundleSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ReliabilityBundle validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTreatmentContextSnapshot(data: unknown) {
  const result = TreatmentContextSnapshotSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TreatmentContextSnapshot validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTargetGeometry(data: unknown) {
  const result = TargetGeometrySchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TargetGeometry validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateEvidenceGovernanceClassification(data: unknown) {
  const result = EvidenceGovernanceClassificationSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `EvidenceGovernanceClassification validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateEvidencePathV2(data: unknown) {
  const result = EvidencePathV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `EvidencePath validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateScientificCompatibilityConfiguration(data: unknown) {
  const result = ScientificCompatibilityConfigurationSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ScientificCompatibilityConfiguration validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTargetCandidateV2(data: unknown) {
  const result = TargetCandidateV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TargetCandidateV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTargetSlateV2(data: unknown) {
  const result = TargetSlateV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TargetSlateV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateProcessingRun(data: unknown) {
  const result = ProcessingRunSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ProcessingRun validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateStructuralMeasurement(data: unknown) {
  const result = StructuralMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `StructuralMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateLesionMeasurement(data: unknown) {
  const result = LesionMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `LesionMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateRestingStateMeasurement(data: unknown) {
  const result = RestingStateMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `RestingStateMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTaskFMRIMeasurement(data: unknown) {
  const result = TaskFMRIMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TaskFMRIMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateDiffusionMeasurement(data: unknown) {
  const result = DiffusionMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `DiffusionMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateMotorMappingMeasurement(data: unknown) {
  const result = MotorMappingMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `MotorMappingMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateMEPMeasurement(data: unknown) {
  const result = MEPMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `MEPMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateAudiologyMeasurement(data: unknown) {
  const result = AudiologyMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `AudiologyMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateEFieldMeasurement(data: unknown) {
  const result = EFieldMeasurementSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `EFieldMeasurement validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateAcquisitionProfile(data: unknown) {
  const result = AcquisitionProfileSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `AcquisitionProfile validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

/**
 * §198. THE MULTIMODAL PIPELINE MUST NEVER — Invariant Validator
 * Validates modality-specific scientific invariants across the 9 modalities.
 */
export function validateModalityMeasurementInvariants(measurement: {
  readonly modality: string;
  readonly [key: string]: unknown;
}) {
  switch (measurement.modality) {
    case 'diffusion_mri': {
      // §43: Streamline count is not axon count
      if (measurement['isAxonCountEquivalent'] !== false) {
        throw new DomainValidationError(
          'Diffusion MRI invariant violation: isAxonCountEquivalent must be strictly false (§43)',
          [],
        );
      }
      break;
    }
    case 'audiology': {
      // §69: Prohibited: tonotopic cortex coordinate calculation from audiology signal alone
      if (
        measurement['tonotopicCortexCoordinate'] ||
        measurement['targetCoordinate'] ||
        measurement['hasTonotopicTargetCoordinates']
      ) {
        throw new DomainValidationError(
          'Audiology invariant violation: audiology signals must not autonomously create cortical targets (§69, §198)',
          [],
        );
      }
      break;
    }
    case 'task_fmri': {
      // §33: Failed behavioral performance must not mark functional area as structurally absent
      if (
        (measurement['behavioralPerformanceValid'] === false ||
          measurement['behavioralCompliance'] === false) &&
        (measurement['status'] === 'qualified' || measurement['inferredAbsentCortex'] === true)
      ) {
        throw new DomainValidationError(
          'Task fMRI invariant violation: failed behavioral performance cannot yield a qualified target refinement measurement or infer absent cortex (§33, §198)',
          [],
        );
      }
      break;
    }
    case 'lesion_mapping': {
      // §20: Lesion mapping shall remain native-space first
      if (!measurement['nativeMaskArtifactId']) {
        throw new DomainValidationError(
          'Lesion mapping invariant violation: nativeMaskArtifactId is mandatory; native space must be preserved (§20)',
          [],
        );
      }
      break;
    }
    case 'motor_mapping': {
      // §48: Motor mapping session must separate spatial map from MEP response
      if (!Array.isArray(measurement['hotspots']) && !Array.isArray(measurement['mappingPoints'])) {
        throw new DomainValidationError(
          'Motor mapping invariant violation: motor mapping must record spatial points or hotspots (§48, §51)',
          [],
        );
      }
      break;
    }
    default:
      break;
  }
  return true;
}

export function validateTransformGraph(data: unknown) {
  const result = TransformGraphSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TransformGraph validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateEvidenceClaimV2(data: unknown) {
  const result = EvidenceClaimV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `EvidenceClaimV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateSourceFinding(data: unknown) {
  const result = SourceFindingSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `SourceFinding validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateClaimEvidenceSynthesis(data: unknown) {
  const result = ClaimEvidenceSynthesisSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ClaimEvidenceSynthesis validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateEvidenceLibraryReleaseV2(data: unknown) {
  const result = EvidenceLibraryReleaseV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `EvidenceLibraryReleaseV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

// ===========================================================================
// Candidate Domain Fit Profiles & Relationships (§74-77, §106)
// ===========================================================================

export function validateLesionTargetRelationship(data: unknown) {
  const result = LesionTargetRelationshipSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `LesionTargetRelationship validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateMotorMappingFitProfile(data: unknown) {
  const result = MotorMappingFitProfileSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `MotorMappingFitProfile validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateStructuralConnectivityFitProfile(data: unknown) {
  const result = StructuralConnectivityFitProfileSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `StructuralConnectivityFitProfile validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTargetTreatmentContextEvaluation(data: unknown) {
  const result = TargetTreatmentContextEvaluationSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TargetTreatmentContextEvaluation validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateResearchTargetExtension(data: unknown) {
  const result = ResearchTargetExtensionSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ResearchTargetExtension validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateCrossIndicationTargetReview(data: unknown) {
  const result = CrossIndicationTargetReviewSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `CrossIndicationTargetReview validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateClinicianModifiedTarget(data: unknown) {
  const result = ClinicianModifiedTargetSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ClinicianModifiedTarget validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTargetEngineInputV2(data: unknown) {
  const result = TargetEngineInputV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TargetEngineInputV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateCanonicalTargetEngineOutputManifestV2(data: unknown) {
  const result = CanonicalTargetEngineOutputManifestV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `CanonicalTargetEngineOutputManifestV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTargetFamilyV2(data: unknown) {
  const result = TargetFamilyV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TargetFamilyV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateTherapeuticCircuitV2(data: unknown) {
  const result = TherapeuticCircuitV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `TherapeuticCircuitV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateClaimTargetBinding(data: unknown) {
  const result = ClaimTargetBindingSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ClaimTargetBinding validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateEvidenceEdge(data: unknown) {
  if (data && typeof data === 'object' && 'edgeType' in data) {
    if ((data as { edgeType: unknown }).edgeType === 'PROVES') {
      throw new DomainValidationError(
        "Prohibited edge type (§15): 'PROVES' edge is strictly forbidden in the MAGNIOM Evidence Knowledge Graph. Use SUPPORTS, VALIDATES, or REPLICATES instead.",
        [],
      );
    }
  }
  const result = EvidenceEdgeSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `EvidenceEdge validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function assertNoProhibitedEvidenceFields(data: unknown): void {
  if (!data || typeof data !== 'object') return;
  const prohibitedClaimFields = [
    'evidence_tier',
    'evidenceTier',
    'magniom_evidence_tier',
    'magniomEvidenceTier',
    'tier',
  ];
  const record = data as Record<string, unknown>;

  // Check claim prohibition (§4, §6)
  for (const field of prohibitedClaimFields) {
    if (field in record && record[field] !== undefined) {
      throw new DomainValidationError(
        `Prohibited evidence field detected (§4, §6): '${field}' must not be stored on EvidenceClaimV2. Tier belongs to EvidenceGovernanceClassification.`,
        [],
      );
    }
  }

  // Check source clinical shortcut prohibition (§94)
  if ('clinical' in record && record.clinical === true) {
    throw new DomainValidationError(
      "Prohibited evidence field detected (§94): 'clinical: true' must not be stored on Source. Clinical eligibility arises from governance and Scientific Policy.",
      [],
    );
  }
}

// ===========================================================================
// Prohibited Canonical Fields Assertion (§138)
// ===========================================================================

export function assertNoProhibitedCanonicalFields(data: unknown): void {
  if (!data || typeof data !== 'object') return;
  const stack: unknown[] = [data];
  const prohibitedSet = new Set<string>(PROHIBITED_CANONICAL_FIELDS as readonly string[]);

  while (stack.length > 0) {
    const current = stack.pop();
    if (current && typeof current === 'object') {
      if (Array.isArray(current)) {
        for (const item of current) {
          if (item && typeof item === 'object') stack.push(item);
        }
      } else {
        for (const [key, value] of Object.entries(current)) {
          if (prohibitedSet.has(key)) {
            throw new DomainValidationError(
              `Prohibited canonical field detected (§138): '${key}' is prohibited from canonical MAGNIOM data representation.`,
              [],
            );
          }
          if (value && typeof value === 'object') {
            stack.push(value);
          }
        }
      }
    }
  }
}

// ===========================================================================
// Canonical Validation Invariant Rules (§113 - §123)
// ===========================================================================

/**
 * §113. CANONICAL VALIDATION — IndicationModuleRelease
 */
export function validateIndicationModuleReleaseRules(data: unknown) {
  const module = validateIndicationModuleRelease(data);
  if (!module.code || !module.semanticVersion) {
    throw new DomainValidationError(
      'IndicationModuleRelease code and semanticVersion are required (§113)',
      [],
    );
  }
  if (!module.indication || !module.indication.conceptId) {
    throw new DomainValidationError('Indication concept must be defined (§113)', []);
  }
  if (!module.intendedPopulation || !module.intendedPopulation.code) {
    throw new DomainValidationError('Intended population must be defined (§113)', []);
  }
  if (!module.permittedModes || module.permittedModes.length === 0) {
    throw new DomainValidationError('Permitted modes must be defined (§113)', []);
  }
  if (!module.phenotypeSchemaVersionId) {
    throw new DomainValidationError('Phenotype schema version must be present (§113)', []);
  }
  if (!module.payloadSha256 || !/^[0-9a-fA-F]{64}$/.test(module.payloadSha256)) {
    throw new DomainValidationError('Valid 64-character payload SHA-256 is required (§113)', []);
  }
  return module;
}

/**
 * §114. VALIDATION — DiseaseStageContext
 */
export function validateDiseaseStageContextRules(data: unknown) {
  const stage = validateDiseaseStageContext(data);
  if (!stage.caseIndicationId) {
    throw new DomainValidationError('DiseaseStageContext must link to CaseIndication (§114)', []);
  }
  if (!stage.currentStageCode || !stage.currentStageLabel) {
    throw new DomainValidationError('Stage code and label must be defined (§114)', []);
  }
  return stage;
}

/**
 * §115. VALIDATION — LesionContext
 */
export function validateLesionContextRules(data: unknown) {
  const lesion = validateLesionContext(data);
  if (!lesion.sourceImagingStudyIds || lesion.sourceImagingStudyIds.length === 0) {
    throw new DomainValidationError('Source imaging study references must resolve (§115)', []);
  }
  if (!lesion.lesionLaterality) {
    throw new DomainValidationError('Lesion laterality must be defined (§115)', []);
  }
  if (!lesion.provenance || !lesion.provenance.softwareVersion) {
    throw new DomainValidationError('LesionContext provenance must be complete (§115)', []);
  }
  return lesion;
}

/**
 * §116. VALIDATION — MeasurementBundle
 */
export function validateMeasurementBundleRules(bundleData: unknown, moduleData?: { id?: string }) {
  const bundle = validateMeasurementBundle(bundleData);
  if (!bundle.caseId || !bundle.caseIndicationId) {
    throw new DomainValidationError(
      'Case and indication IDs are mandatory in MeasurementBundle (§116)',
      [],
    );
  }
  if (!bundle.measurements || bundle.measurements.length === 0) {
    throw new DomainValidationError(
      'MeasurementBundle must contain at least one measurement (§116)',
      [],
    );
  }
  if (!bundle.payloadSha256 || !/^[0-9a-fA-F]{64}$/.test(bundle.payloadSha256)) {
    throw new DomainValidationError('Valid 64-character payload SHA-256 is required (§116)', []);
  }
  if (moduleData && moduleData.id && bundle.indicationModuleReleaseId !== moduleData.id) {
    throw new DomainValidationError(
      `MeasurementBundle indicationModuleReleaseId (${bundle.indicationModuleReleaseId}) does not match module (${moduleData.id}) (§116)`,
      [],
    );
  }
  return bundle;
}

/**
 * §117. VALIDATION — ReliabilityBundle
 */
export function validateReliabilityBundleRules(relData: unknown, bundleData?: { id?: string }) {
  const rel = validateReliabilityBundle(relData);
  if (!rel.componentReliabilityIds || rel.componentReliabilityIds.length === 0) {
    throw new DomainValidationError(
      'ReliabilityBundle must reference component reliabilities (§117)',
      [],
    );
  }
  if (bundleData && bundleData.id && rel.measurementBundleId !== bundleData.id) {
    throw new DomainValidationError(
      `ReliabilityBundle measurementBundleId (${rel.measurementBundleId}) does not match MeasurementBundle (${bundleData.id}) (§117)`,
      [],
    );
  }
  // Hard invariant: Failed reliability cannot produce a qualified capability (§117)
  if (rel.capabilityQualification) {
    for (const cap of rel.capabilityQualification) {
      if (
        cap.status === 'qualified' &&
        rel.limitingFactors.some(f => f.toLowerCase().includes('failed'))
      ) {
        throw new DomainValidationError(
          `Failed reliability cannot produce a qualified capability: ${cap.capabilityCode} (§117)`,
          [],
        );
      }
    }
  }
  return rel;
}

/**
 * §118. VALIDATION — TARGET GEOMETRY
 */
export function validateTargetGeometryRules(geomData: unknown, permittedTypes?: readonly string[]) {
  const geom = validateTargetGeometry(geomData);
  if (permittedTypes && !permittedTypes.includes(geom.geometryType)) {
    throw new DomainValidationError(
      `Target geometry type '${geom.geometryType}' is not permitted by active module configuration (§118)`,
      [],
    );
  }
  if (!geom.coordinateSpace || !geom.coordinateSpace.name) {
    throw new DomainValidationError(
      'TargetGeometry must specify explicit coordinate space (§118)',
      [],
    );
  }
  if (!geom.laterality) {
    throw new DomainValidationError('TargetGeometry laterality must be defined (§118)', []);
  }

  // Type-specific geometry validation
  if (geom.geometryType === 'somatotopic') {
    const somato = geom as { bodyRegion?: { code?: string }; stimulationHemisphere?: string };
    if (!somato.bodyRegion || !somato.bodyRegion.code) {
      throw new DomainValidationError(
        'Somatotopic geometry requires body region reference (§118)',
        [],
      );
    }
    if (!somato.stimulationHemisphere) {
      throw new DomainValidationError(
        'Somatotopic geometry requires stimulation hemisphere (§118)',
        [],
      );
    }
  } else if (geom.geometryType === 'coil_field') {
    const coil = geom as { coilModelId?: string; intendedFieldRegion?: unknown };
    if (!coil.coilModelId) {
      throw new DomainValidationError('Coil field geometry requires coilModelId (§118)', []);
    }
    if (!coil.intendedFieldRegion) {
      throw new DomainValidationError(
        'Coil field geometry requires intendedFieldRegion (§118)',
        [],
      );
    }
  } else if (geom.geometryType === 'point') {
    const pt = geom as { centre?: { x?: number; y?: number; z?: number } };
    if (!pt.centre || typeof pt.centre.x !== 'number') {
      throw new DomainValidationError(
        'Point target geometry requires 3D centre coordinate (§118)',
        [],
      );
    }
  }
  return geom;
}

/**
 * §119. VALIDATION — TARGET CANDIDATE
 */
export function validateTargetCandidateRules(candidateData: unknown) {
  const cand = validateTargetCandidateV2(candidateData);
  if (!cand.caseId || !cand.caseIndicationId) {
    throw new DomainValidationError(
      'Target candidate requires valid case and CaseIndication IDs (§119)',
      [],
    );
  }
  if (!cand.indicationModuleReleaseId || !cand.scientificPolicyReleaseId) {
    throw new DomainValidationError(
      'Target candidate requires indication module and policy releases (§119)',
      [],
    );
  }
  if (!cand.targetFamilyId) {
    throw new DomainValidationError('Target candidate requires targetFamilyId (§119)', []);
  }
  if (!cand.nominationRationale) {
    throw new DomainValidationError('Target candidate requires nominationRationale (§119)', []);
  }
  return cand;
}

/**
 * §120. VALIDATION — TARGET SLATE
 */
export function validateTargetSlateRules(slateData: unknown, candidatesData?: readonly unknown[]) {
  const slate = validateTargetSlateV2(slateData);

  // Maximum role/position cardinality: max 3 primary, max 2 additional (§84, §120)
  if (slate.primaryCandidates.length > 3) {
    throw new DomainValidationError(
      `Target Slate exceeds maximum 3 primary candidates (${slate.primaryCandidates.length}) (§120)`,
      [],
    );
  }
  if (slate.additionalCandidates.length > 2) {
    throw new DomainValidationError(
      `Target Slate exceeds maximum 2 additional candidates (${slate.additionalCandidates.length}) (§120)`,
      [],
    );
  }

  // Ensure unique candidate IDs
  const allIds = [
    ...slate.primaryCandidates.map(c => c.targetCandidateId),
    ...slate.additionalCandidates.map(c => c.targetCandidateId),
  ];
  if (new Set(allIds).size !== allIds.length) {
    throw new DomainValidationError(
      'Target Slate contains duplicate candidate references (§120)',
      [],
    );
  }

  // Validate candidate alignment if provided
  if (candidatesData && candidatesData.length > 0) {
    const candidates = candidatesData.map(c => validateTargetCandidateV2(c));
    for (const c of candidates) {
      if (c.caseIndicationId !== slate.caseIndicationId) {
        throw new DomainValidationError(
          `Target candidate ${c.id} CaseIndicationId (${c.caseIndicationId}) does not match slate (${slate.caseIndicationId}) (§120)`,
          [],
        );
      }
      if (c.indicationModuleReleaseId !== slate.indicationModuleReleaseId) {
        throw new DomainValidationError(
          `Target candidate ${c.id} indication module (${c.indicationModuleReleaseId}) does not match slate (${slate.indicationModuleReleaseId}) (§120)`,
          [],
        );
      }
      if (
        (slate.mode as string).toUpperCase() === 'CLINICAL' &&
        (c.mode as string).toUpperCase() === 'RESEARCH'
      ) {
        throw new DomainValidationError(
          `Research candidate ${c.id} cannot be included in Clinical Slate (§120)`,
          [],
        );
      }
    }
  }
  return slate;
}

/**
 * §121. CROSS-CASE INTEGRITY
 */
export function validateCrossCaseIntegrity(
  entities: readonly { caseId?: string; case_id?: string }[],
) {
  if (entities.length === 0) return;
  const firstCaseId = entities[0]?.caseId ?? entities[0]?.case_id;
  if (!firstCaseId) {
    throw new DomainValidationError(
      'Cross-case integrity requires defined caseId on all objects (§121)',
      [],
    );
  }
  for (const entity of entities) {
    const entityCaseId = entity.caseId ?? entity.case_id;
    if (entityCaseId !== firstCaseId) {
      throw new DomainValidationError(
        `Cross-case integrity violation (§121): Object belongs to Case ${entityCaseId}, but targeting analysis is for Case ${firstCaseId}.`,
        [],
      );
    }
  }
}

/**
 * §122. CROSS-INDICATION INTEGRITY
 */
export function validateCrossIndicationIntegrity(
  slate: { indicationModuleReleaseId?: string },
  candidates: readonly { indicationModuleReleaseId?: string; id?: string }[],
) {
  if (!slate.indicationModuleReleaseId) {
    throw new DomainValidationError('Slate indicationModuleReleaseId must be defined (§122)', []);
  }
  for (const candidate of candidates) {
    if (
      candidate.indicationModuleReleaseId &&
      candidate.indicationModuleReleaseId !== slate.indicationModuleReleaseId
    ) {
      throw new DomainValidationError(
        `Cross-indication integrity violation (§122): Candidate ${candidate.id ?? 'unknown'} from module ${candidate.indicationModuleReleaseId} cannot be included in slate for module ${slate.indicationModuleReleaseId}.`,
        [],
      );
    }
  }
}

/**
 * §123. MODULE VERSION INTEGRITY
 */
export function validateModuleVersionIntegrity(
  historicalSlate: { indicationModuleReleaseId: string; generatedAt: string },
  activeModuleRelease: { id: string },
) {
  if (historicalSlate.indicationModuleReleaseId !== activeModuleRelease.id) {
    // Historical slate remains immutable and pinned to original release; cannot be silently updated (§123)
    return {
      status: 'historical_pinned',
      originalModuleReleaseId: historicalSlate.indicationModuleReleaseId,
      activeModuleReleaseId: activeModuleRelease.id,
      requiresNewSlateAnalysis: true,
    };
  }
  return {
    status: 'current_version_match',
    originalModuleReleaseId: historicalSlate.indicationModuleReleaseId,
    activeModuleReleaseId: activeModuleRelease.id,
    requiresNewSlateAnalysis: false,
  };
}

/**
 * Scientific Policy v2.0 Validators (§14, §15, §90-95, §196)
 */

export function validateScientificPolicyReleaseV2(data: unknown) {
  const result = ScientificPolicyReleaseV2Schema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ScientificPolicyReleaseV2 validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateIndicationPolicyBinding(data: unknown) {
  const result = IndicationPolicyBindingSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `IndicationPolicyBinding validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateScientificImpactReport(data: unknown) {
  const result = ScientificImpactReportSchema.safeParse(data);
  if (!result.success) {
    throw new DomainValidationError(
      `ScientificImpactReport validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}

export function validateScientificPolicyParameters(
  parameters: Record<string, unknown>,
  definitions: readonly {
    code: string;
    valueType: 'number' | 'string' | 'boolean' | 'string_array';
    bounds?: {
      minValue?: number;
      maxValue?: number;
      allowedValues?: readonly (string | number)[];
      unit?: string;
    };
  }[],
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const def of definitions) {
    const val = parameters[def.code];
    if (val === undefined) {
      continue;
    }

    if (def.valueType === 'number') {
      if (typeof val !== 'number' || Number.isNaN(val)) {
        violations.push(`Parameter '${def.code}' must be a number (got ${typeof val})`);
        continue;
      }
      if (def.bounds?.minValue !== undefined && val < def.bounds.minValue) {
        violations.push(
          `POLICY_PARAMETER_OUT_OF_BOUNDS: Parameter '${def.code}' value ${val} is below minimum ${def.bounds.minValue} (§91: no clamping permitted)`,
        );
      }
      if (def.bounds?.maxValue !== undefined && val > def.bounds.maxValue) {
        violations.push(
          `POLICY_PARAMETER_OUT_OF_BOUNDS: Parameter '${def.code}' value ${val} exceeds maximum ${def.bounds.maxValue} (§91: no clamping permitted)`,
        );
      }
    } else if (def.valueType === 'string') {
      if (typeof val !== 'string') {
        violations.push(`Parameter '${def.code}' must be a string (got ${typeof val})`);
        continue;
      }
      if (def.bounds?.allowedValues && !def.bounds.allowedValues.includes(val)) {
        violations.push(
          `POLICY_PARAMETER_OUT_OF_BOUNDS: Parameter '${def.code}' value '${val}' not in allowed set: [${def.bounds.allowedValues.join(', ')}]`,
        );
      }
    } else if (def.valueType === 'boolean') {
      if (typeof val !== 'boolean') {
        violations.push(`Parameter '${def.code}' must be a boolean (got ${typeof val})`);
      }
    } else if (def.valueType === 'string_array') {
      if (!Array.isArray(val) || !val.every(item => typeof item === 'string')) {
        violations.push(`Parameter '${def.code}' must be an array of strings`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
