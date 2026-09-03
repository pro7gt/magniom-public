/**
 * @magniom/measurement-core - Measurement and Reliability Bundle Assembler
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§31-44)
 * and MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§70-79)
 * Exit Criterion 6 (Case Identity) & Exit Criterion 8 (Immutable Output).
 */

import type {
  CanonicalMeasurement,
  MeasurementBundle,
  MeasurementBundleQualificationStatus,
  MeasurementRef,
  MeasurementRequirementEvaluation,
  MeasurementReliability,
  ReliabilityBundle,
  ReliabilityCapabilityQualification,
  OverallQualificationStatus,
  CommonProvenance,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';

export interface BundleAssemblyRequest {
  readonly bundleId: string;
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly indicationModuleReleaseId: string;
  readonly phenotypeSnapshotId: string;
  readonly diseaseStageContextId?: string;
  readonly lesionContextIds?: readonly string[];
  readonly measurements: readonly CanonicalMeasurement[];
  readonly requiredCapabilities?: readonly string[];
  readonly provenance: CommonProvenance;
}

export class MeasurementBundleAssembler {
  /**
   * Assembles an immutable MeasurementBundle snapshot.
   * Enforces Exit Criterion 6: Case Identity across all component measurements.
   */
  public static assembleBundle(request: BundleAssemblyRequest): MeasurementBundle {
    const limitingFactors: string[] = [];

    // Exit Criterion 6: Check Case Identity
    for (const m of request.measurements) {
      if (m.caseId !== request.caseId) {
        throw new Error(
          `CRITICAL CASE IDENTITY ERROR: Measurement ${m.id} belongs to case ${m.caseId}, but bundle is being assembled for case ${request.caseId}. Hard cross-case rejection enforced.`,
        );
      }
    }

    const measurementRefs: MeasurementRef[] = request.measurements.map(m => {
      const ref: MeasurementRef = {
        measurementId: m.id,
        modality: m.modality,
        version: m.version,
        status: m.status,
        pipelineVersionIds: m.pipelineVersionIds,
        artifactIds: m.artifactIds,
        ...(m.acquisitionTime ? { acquisitionTime: m.acquisitionTime } : {}),
      };
      return ref;
    });

    const evaluations: MeasurementRequirementEvaluation[] = [];
    const requiredCaps = request.requiredCapabilities ?? [];

    for (const reqCode of requiredCaps) {
      const satisfyingMeasurements = request.measurements.filter(
        m => m.status === 'qualified' || m.status === 'qualified_with_limits',
      );

      const satisfied = satisfyingMeasurements.length > 0;
      evaluations.push({
        requirementCode: reqCode,
        satisfied,
        satisfyingMeasurementIds: satisfyingMeasurements.map(m => m.id),
        resultingCapability: satisfied ? 'enabled' : 'disabled',
        explanation: satisfied
          ? `Requirement ${reqCode} satisfied by ${satisfyingMeasurements.length} qualified measurement(s).`
          : `Requirement ${reqCode} is unsatisfied; required measurements missing or failed.`,
      });

      if (!satisfied) {
        limitingFactors.push(`Unsatisfied measurement requirement: ${reqCode}`);
      }
    }

    let qualificationStatus: MeasurementBundleQualificationStatus = 'qualified';
    if (evaluations.some(e => !e.satisfied)) {
      qualificationStatus =
        evaluations.length === limitingFactors.length ? 'insufficient' : 'qualified_with_limits';
    }

    // Exit Criterion 8: Compute deterministic payload SHA-256
    const payloadForHashing = JSON.stringify({
      id: request.bundleId,
      caseId: request.caseId,
      caseIndicationId: request.caseIndicationId,
      indicationModuleReleaseId: request.indicationModuleReleaseId,
      measurements: measurementRefs,
      evaluations,
      qualificationStatus,
    });
    const payloadSha256 = computeSha256(payloadForHashing);

    const bundle: MeasurementBundle = {
      id: request.bundleId,
      version: '2.0.0',
      caseId: request.caseId,
      caseIndicationId: request.caseIndicationId,
      indicationModuleReleaseId: request.indicationModuleReleaseId,
      phenotypeSnapshotId: request.phenotypeSnapshotId,
      ...(request.diseaseStageContextId
        ? { diseaseStageContextId: request.diseaseStageContextId }
        : {}),
      ...(request.lesionContextIds ? { lesionContextIds: request.lesionContextIds } : {}),
      measurements: measurementRefs,
      qualificationStatus,
      requirementEvaluations: evaluations,
      limitingFactors,
      createdAt: new Date().toISOString(),
      payloadSha256,
      provenance: request.provenance,
    };

    return Object.freeze(bundle);
  }

  /**
   * Assembles an immutable ReliabilityBundle snapshot.
   */
  public static assembleReliabilityBundle(request: {
    readonly reliabilityBundleId: string;
    readonly caseId: string;
    readonly caseIndicationId: string;
    readonly indicationModuleReleaseId: string;
    readonly measurementBundleId: string;
    readonly reliabilities: readonly MeasurementReliability[];
    readonly capabilityQualifications: readonly ReliabilityCapabilityQualification[];
    readonly provenance: CommonProvenance;
  }): ReliabilityBundle {
    // Check Case Identity
    for (const r of request.reliabilities) {
      if (r.caseId !== request.caseId) {
        throw new Error(
          `CRITICAL CASE IDENTITY ERROR: MeasurementReliability ${r.id} belongs to case ${r.caseId}, not ${request.caseId}.`,
        );
      }
    }

    const limitingFactors: string[] = [];
    let overallQualification: OverallQualificationStatus = 'qualified';

    const hasFailedCaps = request.capabilityQualifications.some(c => c.status === 'not_qualified');
    const hasLimitedCaps = request.capabilityQualifications.some(
      c => c.status === 'qualified_with_limits',
    );

    if (hasFailedCaps) {
      overallQualification = 'not_qualified';
      limitingFactors.push('One or more capabilities failed reliability qualification.');
    } else if (hasLimitedCaps) {
      overallQualification = 'qualified_with_limits';
      limitingFactors.push('One or more capabilities qualified with operational limits.');
    }

    const payloadForHashing = JSON.stringify({
      id: request.reliabilityBundleId,
      caseId: request.caseId,
      measurementBundleId: request.measurementBundleId,
      reliabilities: request.reliabilities.map(r => r.id),
      capabilityQualifications: request.capabilityQualifications,
      overallQualification,
    });
    const payloadSha256 = computeSha256(payloadForHashing);

    const bundle: ReliabilityBundle = {
      id: request.reliabilityBundleId,
      version: '2.0.0',
      caseId: request.caseId,
      caseIndicationId: request.caseIndicationId,
      indicationModuleReleaseId: request.indicationModuleReleaseId,
      measurementBundleId: request.measurementBundleId,
      componentReliabilityIds: request.reliabilities.map(r => r.id),
      capabilityQualification: request.capabilityQualifications,
      overallQualification,
      limitingFactors,
      interpretation:
        overallQualification === 'qualified'
          ? 'High multimodal reliability across evaluated patient-specific capabilities.'
          : `Multimodal reliability restricted: ${limitingFactors.join('; ')}`,
      payloadSha256,
      provenance: request.provenance,
    };

    return Object.freeze(bundle);
  }
}
