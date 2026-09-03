/**
 * MAGNIOM Canonical Domain Validation Functions v2.0
 * Provides typed validation wrappers and domain invariant enforcement
 */

import { z } from 'zod';
import {
  IndicationModuleReleaseSchema,
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
} from './v2-schemas.js';

export class DomainValidationError extends Error {
  public readonly issues: readonly z.ZodIssue[];

  constructor(message: string, issues: readonly z.ZodIssue[]) {
    super(message);
    this.name = 'DomainValidationError';
    this.issues = issues;
  }
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
