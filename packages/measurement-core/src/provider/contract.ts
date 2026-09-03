/**
 * @magniom/measurement-core - Measurement Provider Contract
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§5-6, §140, §193)
 * Every provider must implement this interface to satisfy the 8 Measurement Platform Exit Criteria.
 */

import type {
  MeasurementModality,
  CanonicalMeasurement,
  MeasurementReliability,
  MeasurementProviderManifest,
} from '@magniom/domain';
import type {
  MeasurementRunContext,
  MeasurementRunResult,
  SourceIntegrityResult,
  ModalityQCResult,
  CapabilityQualificationResult,
  LateralityValidationResult,
} from '../types.js';

export interface MeasurementProvider<
  TMeasurement extends CanonicalMeasurement = CanonicalMeasurement,
> {
  readonly manifest: MeasurementProviderManifest;
  readonly modality: MeasurementModality;

  /**
   * Exit Criterion 1: Source Integrity
   * Verifies hashes, checks for truncations/corruption, validates ingestion headers.
   */
  validateSourceIntegrity(context: MeasurementRunContext): SourceIntegrityResult;

  /**
   * Exit Criterion 2 & 8: Processing Provenance & Immutable Output
   * Executes deterministic processing run, producing immutable run record and measurement.
   */
  process(context: MeasurementRunContext): MeasurementRunResult<TMeasurement>;

  /**
   * Exit Criterion 3: Quality Control
   * Separates technical acquisition/processing quality from reliability.
   */
  evaluateQC(measurement: TMeasurement): ModalityQCResult;

  /**
   * Exit Criterion 4: Reliability
   * Evaluates method-specific reproducibility, test-retest, split-half, or spatial stability.
   */
  evaluateReliability(
    measurement: TMeasurement,
    qcResult: ModalityQCResult,
  ): MeasurementReliability;

  /**
   * Exit Criterion 5: Capability Qualification
   * Separates technical capability from indication-specific clinical qualification.
   */
  qualifyCapability(
    capabilityCode: string,
    measurement: TMeasurement,
    reliability: MeasurementReliability,
    indicationModuleCode?: string,
  ): CapabilityQualificationResult;

  /**
   * Exit Criterion 6: Case Identity
   * Ensures that all inputs strictly belong to the specified caseId.
   */
  validateCaseIdentity(context: MeasurementRunContext, targetCaseId: string): boolean;

  /**
   * Exit Criterion 7: Laterality
   * Enforces that spatial/anatomical laterality matches clinical expectations without silent inversion.
   */
  validateLaterality(
    measurement: TMeasurement,
    clinicalContext?: {
      readonly affectedLimbLaterality?: string;
      readonly reportedPainLaterality?: string;
      readonly targetHemisphere?: string;
      readonly reportedTinnitusSide?: string;
    },
  ): LateralityValidationResult;
}
