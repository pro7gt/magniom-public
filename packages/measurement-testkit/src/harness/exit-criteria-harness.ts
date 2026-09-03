/**
 * @magniom/measurement-testkit - Measurement Platform Exit Criteria Harness
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§140, §193)
 * Every provider must pass all 8 Exit Criteria before a clinical indication module may depend upon it.
 */

import type { CanonicalMeasurement } from '@magniom/domain';
import {
  type MeasurementProvider,
  type MeasurementRunContext,
  MeasurementBundleAssembler,
} from '@magniom/measurement-core';

export interface ExitCriteriaVerificationReport {
  readonly providerCode: string;
  readonly modality: string;
  readonly sourceIntegrityPassed: boolean;
  readonly processingProvenancePassed: boolean;
  readonly qcPassed: boolean;
  readonly reliabilityPassed: boolean;
  readonly capabilityQualificationPassed: boolean;
  readonly caseIdentityPassed: boolean;
  readonly lateralityPassed: boolean;
  readonly immutableOutputPassed: boolean;
  readonly allPassed: boolean;
  readonly details: readonly string[];
}

export class ExitCriteriaHarness {
  /**
   * Evaluates all 8 Measurement Platform Exit Criteria for the given provider.
   */
  public static verifyProvider<T extends CanonicalMeasurement>(
    provider: MeasurementProvider<T>,
    validContext: MeasurementRunContext,
    targetCapabilityCode: string,
    indicationModuleCode: string,
  ): ExitCriteriaVerificationReport {
    const details: string[] = [];

    // 1. Source Integrity
    const sourceIntegrity = provider.validateSourceIntegrity(validContext);
    const sourceIntegrityPassed = sourceIntegrity.valid && Boolean(sourceIntegrity.computedSha256);
    details.push(
      `1. Source Integrity: ${sourceIntegrityPassed ? 'PASS' : 'FAIL'} (${sourceIntegrity.issues.join('; ') || 'No issues'})`,
    );

    // 2. Processing Provenance & 8. Immutable Output
    const runResult = provider.process(validContext);
    const processingProvenancePassed =
      Boolean(runResult.processingRun.id) &&
      runResult.processingRun.status === 'succeeded' &&
      Boolean(runResult.processingRun.configurationSha256) &&
      Boolean(runResult.processingRun.runManifestSha256);
    details.push(`2. Processing Provenance: ${processingProvenancePassed ? 'PASS' : 'FAIL'}`);

    // 3. Quality Control
    const qc = provider.evaluateQC(runResult.measurement);
    const qcPassed = qc.qcStatus === 'pass' || qc.qcStatus === 'conditional';
    details.push(`3. Quality Control: ${qcPassed ? 'PASS' : 'FAIL'} (Status: ${qc.qcStatus})`);

    // 4. Reliability
    const rel = provider.evaluateReliability(runResult.measurement, qc);
    const reliabilityPassed =
      Boolean(rel.id) && rel.metrics.length > 0 && rel.reliabilityClass !== 'not_assessable';
    details.push(
      `4. Reliability: ${reliabilityPassed ? 'PASS' : 'FAIL'} (Class: ${rel.reliabilityClass})`,
    );

    // 5. Capability Qualification (Capability Validation != Pipeline Validation)
    const capQual = provider.qualifyCapability(
      targetCapabilityCode,
      runResult.measurement,
      rel,
      indicationModuleCode,
    );
    const capabilityQualificationPassed =
      capQual.capabilityCode === targetCapabilityCode &&
      Boolean(capQual.qualification) &&
      capQual.reasons.length > 0;
    details.push(
      `5. Capability Qualification: ${capabilityQualificationPassed ? 'PASS' : 'FAIL'} (Capability: ${capQual.capabilityCode}, Status: ${capQual.qualification})`,
    );

    // 6. Case Identity
    const correctIdentity = provider.validateCaseIdentity(validContext, validContext.caseId);
    const foreignIdentity = provider.validateCaseIdentity(
      validContext,
      '00000000-0000-0000-0000-000000000000',
    );
    const caseIdentityPassed = correctIdentity && !foreignIdentity;
    details.push(`6. Case Identity: ${caseIdentityPassed ? 'PASS' : 'FAIL'}`);

    // 7. Laterality
    const lateralityResult = provider.validateLaterality(runResult.measurement);
    const lateralityPassed = lateralityResult.valid && !lateralityResult.conflictDetected;
    details.push(
      `7. Laterality: ${lateralityPassed ? 'PASS' : 'FAIL'} (${lateralityResult.message})`,
    );

    // 8. Immutable Output (Sealing into MeasurementBundle)
    let immutableOutputPassed = false;
    try {
      const bundle = MeasurementBundleAssembler.assembleBundle({
        bundleId: `BUNDLE-${validContext.caseId.slice(0, 8)}`,
        caseId: validContext.caseId,
        caseIndicationId: 'CASE-IND-01',
        indicationModuleReleaseId: indicationModuleCode,
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000001',
        measurements: [runResult.measurement],
        provenance: {
          createdBy: 'test-harness',
          createdAt: new Date().toISOString(),
          softwareVersion: '2.0.0',
        },
      });

      immutableOutputPassed =
        Boolean(bundle.payloadSha256) &&
        bundle.measurements.length === 1 &&
        Object.isFrozen(bundle);
    } catch {
      immutableOutputPassed = false;
    }
    details.push(`8. Immutable Output: ${immutableOutputPassed ? 'PASS' : 'FAIL'}`);

    const allPassed =
      sourceIntegrityPassed &&
      processingProvenancePassed &&
      qcPassed &&
      reliabilityPassed &&
      capabilityQualificationPassed &&
      caseIdentityPassed &&
      lateralityPassed &&
      immutableOutputPassed;

    return {
      providerCode: provider.manifest.code,
      modality: provider.modality,
      sourceIntegrityPassed,
      processingProvenancePassed,
      qcPassed,
      reliabilityPassed,
      capabilityQualificationPassed,
      caseIdentityPassed,
      lateralityPassed,
      immutableOutputPassed,
      allPassed,
      details,
    };
  }
}
