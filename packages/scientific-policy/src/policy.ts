import type {
  MagniomMode,
  EvidenceTier,
  CandidateRole,
  TargetMethod,
  ClinicalConceptRef,
  ObjectLifecycleStatus,
  ValidationType,
} from '@magniom/domain';

export interface ValidationEvidenceRef {
  readonly id: string;
  readonly validationType: ValidationType;
  readonly protocolId: string;
  readonly reportId: string;
  readonly datasetReleaseId?: string;
  readonly passed: boolean;
  readonly limitations: readonly string[];
  readonly completedAt: string;
}

export interface ScientificCompatibilityProfile {
  readonly id: string;
  readonly code: string;
  readonly indication: ClinicalConceptRef;
  readonly mode: MagniomMode;
  readonly capability:
    | 'evidence_only'
    | 'connectome_refined'
    | 'connectome_normative'
    | 'connectome_efield'
    | 'research_experimental';
  readonly evidenceLibraryReleaseId: string;
  readonly targetEngineVersionId: string;
  readonly pipeline: {
    readonly requirement: 'required' | 'optional' | 'disabled' | 'not_applicable';
    readonly permittedVersionIds: readonly string[];
  };
  readonly normativeModel: {
    readonly requirement: 'required' | 'optional' | 'disabled' | 'not_applicable';
    readonly permittedVersionIds: readonly string[];
  };
  readonly efieldEngine: {
    readonly requirement: 'required' | 'optional' | 'disabled' | 'not_applicable';
    readonly permittedVersionIds: readonly string[];
  };
  readonly phenotypeOntologyVersionId: string;
  readonly compatible: boolean;
  readonly validationEvidenceIds: readonly string[];
  readonly limitations: readonly string[];
}

export interface EvidenceTierPermission {
  readonly tier: EvidenceTier;
  readonly standalonePrimary: boolean;
  readonly standaloneAdditional: boolean;
  readonly mayRefineParentTiers: readonly EvidenceTier[];
  readonly maySupplySupportingContext: boolean;
  readonly permittedCandidateRoles: readonly CandidateRole[];
  readonly permittedGenerationMethods: readonly TargetMethod[];
}

export interface EvidenceEligibilityPolicy {
  readonly tierPermissions: readonly EvidenceTierPermission[];
  readonly minReliabilityForPersonalisation: number; // e.g. 0.70
  readonly minIncrementalGainThreshold: number; // e.g. 0.10
}

export interface ScientificPolicyRelease {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly title: string;
  readonly description: string;
  readonly lifecycleStatus: ObjectLifecycleStatus;
  readonly validationStatus: 'ESTABLISHED' | 'VALIDATED' | 'RESEARCH_ONLY';
  readonly modeScope: readonly MagniomMode[];
  readonly indicationScope: readonly ClinicalConceptRef[];
  readonly compatibilityProfiles: readonly ScientificCompatibilityProfile[];
  readonly evidencePolicy: EvidenceEligibilityPolicy;
  readonly parameters: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  readonly policyPayloadSha256: string;
  readonly compatibilityManifestSha256: string;
  readonly releaseManifestSha256: string;
  readonly createdAt: string;
  readonly releasedAt?: string;
}
