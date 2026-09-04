/**
 * MAGNIOM Scientific Policy Failure Codes & Clinician Messaging
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§159-160)
 */

export const SCIENTIFIC_POLICY_FAILURE_CODES = [
  'SCIENTIFIC_POLICY_NOT_FOUND',
  'SCIENTIFIC_POLICY_NOT_ACTIVE',
  'SCIENTIFIC_POLICY_MODE_MISMATCH',
  'SCIENTIFIC_POLICY_INTEGRITY_FAILURE',
  'SCIENTIFIC_POLICY_SIGNATURE_INVALID',
  'INDICATION_MODULE_NOT_FOUND',
  'INDICATION_MODULE_VERSION_INCOMPATIBLE',
  'INDICATION_MODULE_MODE_MISMATCH',
  'INDICATION_MODULE_NOT_CLINICALLY_PERMITTED',
  'INDICATION_POLICY_BINDING_NOT_FOUND',
  'SCIENTIFIC_CONFIGURATION_INCOMPATIBLE',
  'EVIDENCE_RELEASE_INCOMPATIBLE',
  'EVIDENCE_PATH_NOT_PERMITTED',
  'EVIDENCE_CLASSIFICATION_INSUFFICIENT',
  'EVIDENCE_CLASSIFICATION_UNASSIGNED',
  'TARGET_ENGINE_VERSION_INCOMPATIBLE',
  'TARGET_PLUGIN_INCOMPATIBLE',
  'TARGET_PLUGIN_INTEGRITY_FAILURE',
  'CANDIDATE_GENERATOR_NOT_PERMITTED',
  'MEASUREMENT_PROVIDER_INCOMPATIBLE',
  'MEASUREMENT_CAPABILITY_NOT_PERMITTED',
  'MEASUREMENT_REQUIREMENT_UNSATISFIED',
  'RELIABILITY_METHOD_INCOMPATIBLE',
  'RELIABILITY_REQUIREMENT_NOT_MET',
  'TARGET_GEOMETRY_NOT_PERMITTED',
  'DISEASE_STAGE_INCOMPATIBLE',
  'LESION_CONTEXT_REQUIRED',
  'TREATMENT_CONTEXT_INCOMPATIBLE',
  'NORMATIVE_MODEL_INCOMPATIBLE',
  'EFIELD_ENGINE_INCOMPATIBLE',
  'DEVICE_CAPABILITY_INCOMPATIBLE',
  'RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION',
  'MULTIMODAL_FUSION_NOT_PERMITTED',
  'POLICY_PARAMETER_MISSING',
  'POLICY_PARAMETER_OUT_OF_BOUNDS',
  'POLICY_PROHIBITED_CONFIGURATION',
  'POLICY_VALIDATION_INSUFFICIENT',
  'POLICY_APPROVAL_INCOMPLETE',
] as const;

export type ScientificPolicyFailureCode = (typeof SCIENTIFIC_POLICY_FAILURE_CODES)[number];

const CLINICIAN_MESSAGE_TEMPLATES: Record<
  ScientificPolicyFailureCode,
  (ctx?: Record<string, unknown>) => string
> = {
  SCIENTIFIC_POLICY_NOT_FOUND: ctx =>
    `The requested scientific policy release '${String(ctx?.policyId ?? 'unspecified')}' is not registered in the immutable release catalog. Target generation cannot proceed.`,
  SCIENTIFIC_POLICY_NOT_ACTIVE: ctx =>
    `Scientific policy release '${String(ctx?.policyCode ?? '')}' has lifecycle status '${String(ctx?.status ?? '')}' and is not active for clinical use.`,
  SCIENTIFIC_POLICY_MODE_MISMATCH: ctx =>
    `The active scientific policy does not authorize operation in '${String(ctx?.mode ?? '')}' mode.`,
  SCIENTIFIC_POLICY_INTEGRITY_FAILURE: () =>
    `Scientific policy cryptographic integrity check failed. The stored payload hash does not match computed checksum. Targeting aborted for patient safety (§126).`,
  SCIENTIFIC_POLICY_SIGNATURE_INVALID: ctx =>
    `The digital signature for scientific policy release '${String(ctx?.policyCode ?? '')}' is invalid or unverified (§127). Target generation is blocked.`,
  INDICATION_MODULE_NOT_FOUND: ctx =>
    `The requested indication module '${String(ctx?.moduleId ?? '')}' is not present in the system manifest.`,
  INDICATION_MODULE_VERSION_INCOMPATIBLE: ctx =>
    `Indication module version '${String(ctx?.providedVersion ?? '')}' does not match the exact authorized release '${String(ctx?.authorizedVersion ?? '')}' (§155). No automatic compatibility inference permitted.`,
  INDICATION_MODULE_MODE_MISMATCH: ctx =>
    `The indication module does not permit '${String(ctx?.mode ?? '')}' mode operation.`,
  INDICATION_MODULE_NOT_CLINICALLY_PERMITTED: ctx =>
    `Target generation rejected: Indication module '${String(ctx?.moduleCode ?? '')}' has maturity '${String(ctx?.maturity ?? 'research_only')}' and is not authorized for Clinical Mode (§96, §152).`,
  INDICATION_POLICY_BINDING_NOT_FOUND: ctx =>
    `No approved IndicationPolicyBinding exists between policy '${String(ctx?.policyCode ?? '')}' and module '${String(ctx?.moduleCode ?? '')}' (§15).`,
  SCIENTIFIC_CONFIGURATION_INCOMPATIBLE: () =>
    `The composite scientific configuration tuple does not match any positively approved whitelist configuration in the active policy (§10, §11).`,
  EVIDENCE_RELEASE_INCOMPATIBLE: ctx =>
    `The provided Evidence Library release '${String(ctx?.evidenceReleaseId ?? '')}' is not approved for this indication configuration.`,
  EVIDENCE_PATH_NOT_PERMITTED: ctx =>
    `EvidencePath '${String(ctx?.pathId ?? '')}' is not permitted for candidate generation in the active clinical policy binding (§30).`,
  EVIDENCE_CLASSIFICATION_INSUFFICIENT: ctx =>
    `Evidence classification level for claim '${String(ctx?.claimId ?? '')}' is insufficient for clinical target recommendation.`,
  EVIDENCE_CLASSIFICATION_UNASSIGNED: () =>
    `EvidenceClaim classification status is 'unassigned' and cannot establish Clinical EvidencePath authority (§32, §154).`,
  TARGET_ENGINE_VERSION_INCOMPATIBLE: ctx =>
    `Target Engine version '${String(ctx?.engineVersion ?? '')}' is not authorized by the active scientific policy (§49).`,
  TARGET_PLUGIN_INCOMPATIBLE: ctx =>
    `Targeting plugin version '${String(ctx?.pluginVersion ?? '')}' is not authorized for module '${String(ctx?.moduleCode ?? '')}'.`,
  TARGET_PLUGIN_INTEGRITY_FAILURE: () =>
    `Targeting plugin package digest mismatch (§53, §156). The installed plugin binary does not match the approved release hash.`,
  CANDIDATE_GENERATOR_NOT_PERMITTED: ctx =>
    `Candidate generator '${String(ctx?.generatorId ?? '')}' is not authorized for clinical execution under active policy (§51).`,
  MEASUREMENT_PROVIDER_INCOMPATIBLE: ctx =>
    `Measurement provider for modality '${String(ctx?.modality ?? '')}' is not compatible with active scientific policy (§39).`,
  MEASUREMENT_CAPABILITY_NOT_PERMITTED: ctx =>
    `Measurement capability '${String(ctx?.capabilityCode ?? '')}' is not authorized for clinical candidate generation (§40).`,
  MEASUREMENT_REQUIREMENT_UNSATISFIED: ctx =>
    `Mandatory measurement requirement for '${String(ctx?.modality ?? '')}' was not satisfied. Target analysis cannot proceed.`,
  RELIABILITY_METHOD_INCOMPATIBLE: ctx =>
    `Reliability assessment method '${String(ctx?.methodId ?? '')}' is not compatible with the active policy binding (§43).`,
  RELIABILITY_REQUIREMENT_NOT_MET: ctx =>
    `Patient-specific refinement is unavailable because the measurement did not meet the validated reliability requirement (${String(ctx?.metric ?? '')}: ${String(ctx?.value ?? '')} vs required ${String(ctx?.threshold ?? '')}). The evidence-supported baseline remains available (§160).`,
  TARGET_GEOMETRY_NOT_PERMITTED: ctx =>
    `Target geometry '${String(ctx?.geometryType ?? '')}' is not authorized for TargetFamily '${String(ctx?.targetFamily ?? '')}' under active policy (§36, §149). Geometry downcasting is strictly prohibited.`,
  DISEASE_STAGE_INCOMPATIBLE: ctx =>
    `Patient disease stage '${String(ctx?.stage ?? '')}' does not match the validated applicability scope of EvidencePath '${String(ctx?.pathCode ?? '')}' (§69, §148).`,
  LESION_CONTEXT_REQUIRED: () =>
    `Patient-specific targeting for this neurological indication requires a qualified LesionContext. Native-space lesion mapping is absent or unverified (§67, §147).`,
  TREATMENT_CONTEXT_INCOMPATIBLE: ctx =>
    `Treatment context condition '${String(ctx?.condition ?? '')}' does not satisfy the requirements of EvidencePath '${String(ctx?.pathCode ?? '')}' (§70).`,
  NORMATIVE_MODEL_INCOMPATIBLE: ctx =>
    `Normative model release '${String(ctx?.modelId ?? '')}' is not authorized for this indication module (§73).`,
  EFIELD_ENGINE_INCOMPATIBLE: ctx =>
    `E-field simulation engine release '${String(ctx?.engineId ?? '')}' is not authorized under the active policy (§75).`,
  DEVICE_CAPABILITY_INCOMPATIBLE: ctx =>
    `The designated TMS device or coil class '${String(ctx?.deviceClass ?? '')}' is not compatible with target semantics for this indication (§78).`,
  RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION: ctx =>
    `Security rejection: Research-only component '${String(ctx?.componentName ?? '')}' was referenced in a Clinical Mode configuration (§103, §153).`,
  MULTIMODAL_FUSION_NOT_PERMITTED: () =>
    `Multimodal coordinate fusion is prohibited unless an approved and validated multimodal model is explicitly active (§47, §106, §158).`,
  POLICY_PARAMETER_MISSING: ctx =>
    `Mandatory scientific parameter '${String(ctx?.paramCode ?? '')}' is missing from the active policy configuration (§90).`,
  POLICY_PARAMETER_OUT_OF_BOUNDS: ctx => {
    const detail =
      ctx?.max !== undefined && Number(ctx?.value) > Number(ctx?.max)
        ? `exceeds maximum ${String(ctx?.max)}`
        : ctx?.min !== undefined && Number(ctx?.value) < Number(ctx?.min)
          ? `falls below minimum ${String(ctx?.min)}`
          : 'is outside validated bounds';
    return `Scientific parameter '${String(ctx?.paramCode ?? '')}' value ${String(ctx?.value ?? '')} ${detail} (outside validated bounds [${String(ctx?.min ?? '')}, ${String(ctx?.max ?? '')}]). Parameter values cannot be silently clamped (§91, §157), no clamping permitted.`;
  },
  POLICY_PROHIBITED_CONFIGURATION: ctx =>
    `Configuration matches global prohibited configuration rule '${String(ctx?.ruleCode ?? '')}': ${String(ctx?.description ?? '')} (§103).`,
  POLICY_VALIDATION_INSUFFICIENT: ctx =>
    `Scientific policy validation status '${String(ctx?.validationStatus ?? '')}' is insufficient for clinical activation (§119).`,
  POLICY_APPROVAL_INCOMPLETE: () =>
    `Required four-role governance approvals (Scientific, Clinical, Technical, Regulatory) are incomplete for this release (§121).`,
};

export function formatClinicianErrorMessage(
  code: ScientificPolicyFailureCode,
  context?: Record<string, unknown>,
): string {
  const formatter = CLINICIAN_MESSAGE_TEMPLATES[code];
  if (formatter) {
    return formatter(context);
  }
  return `Scientific policy failure (${code}): An unclassified configuration violation occurred. Target calculation fail-closed.`;
}
