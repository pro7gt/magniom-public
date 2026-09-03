/**
 * @magniom/target-engine - Reproducibility Manifest Generator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§128)
 */

import type { ReproducibilityManifestV2, ResolvedTargetEngineContextV2 } from '@magniom/domain';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';

export function computeInputManifestHash(context: ResolvedTargetEngineContextV2): string {
  const normalizedInput = {
    caseId: context.request.caseId,
    caseIndicationId: context.request.caseIndicationId,
    mode: context.request.mode,
    indicationModuleReleaseId: context.request.indicationModuleReleaseId,
    phenotypeSnapshotId: context.request.phenotypeSnapshotId,
    clinicalObjectiveIds: [...context.request.clinicalObjectiveIds].sort(),
    diseaseStageContextId: context.request.diseaseStageContextId,
    lesionContextIds: context.request.lesionContextIds
      ? [...context.request.lesionContextIds].sort()
      : [],
    treatmentContextSnapshotId: context.request.treatmentContextSnapshotId,
    measurementBundleId: context.request.measurementBundleId,
    reliabilityBundleId: context.request.reliabilityBundleId,
    evidenceLibraryReleaseId: context.request.evidenceLibraryReleaseId,
    scientificPolicyReleaseId: context.request.scientificPolicyReleaseId,
    phenotypeSymptomScores: context.phenotypeSnapshot.symptomScores,
    measurementRequirementEvaluations: context.measurementBundle.requirementEvaluations,
    policyParameters: context.scientificPolicy.parameters,
  };

  return computeSha256(canonicalJsonStringify(normalizedInput));
}

export function buildReproducibilityManifest(
  context: ResolvedTargetEngineContextV2,
  pluginId: string,
  pluginVersion: string,
  executedGeneratorManifestHashes: readonly string[],
  outputPayloadSha256: string,
  generatedAt: string,
): ReproducibilityManifestV2 {
  const inputManifestSha256 = computeInputManifestHash(context);

  return {
    inputManifestSha256,
    engineReleaseId: context.request.targetEngineReleaseId,
    pluginId,
    pluginVersion,
    executedGeneratorManifestHashes: [...executedGeneratorManifestHashes].sort(),
    outputPayloadSha256,
    generatedAt,
    mode: context.request.mode,
  };
}
