/**
 * @magniom/measurement-core - Core Measurement Platform Types
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
 */

import type {
  CapabilityQualificationStatus,
  MeasurementQualification,
  CanonicalMeasurement,
  MeasurementReliability,
  ProcessingRun,
} from '@magniom/domain';

export interface SourceIntegrityResult {
  readonly valid: boolean;
  readonly computedSha256: string;
  readonly expectedSha256?: string;
  readonly issues: readonly string[];
}

export interface ModalityQCResult {
  readonly qcStatus: 'pass' | 'conditional' | 'fail';
  readonly metrics: Record<string, number | string | boolean>;
  readonly warnings: readonly string[];
  readonly criticalFailures: readonly string[];
}

export interface CapabilityQualificationResult {
  readonly capabilityCode: string;
  readonly qualification: CapabilityQualificationStatus;
  readonly measurementQualification: MeasurementQualification;
  readonly isAllowedForClinicalMode: boolean;
  readonly reasons: readonly string[];
}

export interface LateralityValidationResult {
  readonly valid: boolean;
  readonly declaredLaterality: string;
  readonly expectedLaterality?: string;
  readonly conflictDetected: boolean;
  readonly message: string;
}

export interface MeasurementRunContext {
  readonly caseId: string;
  readonly organisationId: string;
  readonly rawInputArtifacts: readonly {
    readonly path: string;
    readonly content: string | Uint8Array;
    readonly sha256: string;
  }[];
  readonly pipelineVersionId: string;
  readonly configurationParameters: Record<string, unknown>;
  readonly containerDigestSha256?: string;
}

export interface MeasurementRunResult<T extends CanonicalMeasurement = CanonicalMeasurement> {
  readonly processingRun: ProcessingRun;
  readonly measurement: T;
  readonly sourceIntegrity: SourceIntegrityResult;
  readonly qcResult: ModalityQCResult;
  readonly reliability: MeasurementReliability;
}
