/**
 * MAGNIOM Canonical Release Domain Types v2.0
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§4-10, §131-134, §183-184)
 */

import type { MagniomMode, ModuleQualificationLevel } from './enums.js';
import type { ComponentReleaseRef } from './compatibility-configuration.js';
export type { IndicationModuleRelease } from './indication-module.js';

export interface SubsystemReleaseRef {
  readonly componentId: string;
  readonly name: string;
  readonly semanticVersion: string;
  readonly sha256: string;
  readonly artifactPath: string;
  readonly frozenAt?: string;
}

export interface ApplicationRelease {
  readonly id: string;
  readonly semanticVersion: string;
  readonly sourceCommit: string;
  readonly buildTimestamp: string;
  readonly artifacts: readonly SubsystemReleaseRef[];
  readonly dbMigrationHead: string;
}

export interface ScientificRelease {
  readonly id: string;
  readonly semanticVersion: string;
  readonly scientificPolicyReleaseId: string;
  readonly evidenceLibraryReleaseId: string;
  readonly targetEngineReleaseId: string;
  readonly releaseSha256: string;
  readonly releasedAt: string;
}

/**
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§125)
 */
export interface TargetEngineRelease {
  readonly id: string;
  readonly semanticVersion: string;
  readonly coreVersion: string;
  readonly coreCodeCommit: string;
  readonly containerDigestSha256: string;
  readonly domainSchemaVersion: string;
  readonly pluginManifests: readonly {
    readonly pluginId: string;
    readonly pluginVersion: string;
    readonly pluginDigestSha256: string;
  }[];
  readonly validatedGoldenSuiteIds: readonly string[];
  readonly configurationSha256: string;
  readonly lifecycleStatus: 'draft' | 'validation' | 'active' | 'superseded' | 'withdrawn';
  readonly approvedAt?: string;
}

export interface IndicationModuleManifestEntry {
  readonly indication_module_release_id: string;
  readonly indicationCode: string;
  readonly qualification_level: ModuleQualificationLevel | string;
  readonly permitted_modes: readonly (MagniomMode | string)[];
  readonly plugin_digest: string;
  readonly goldenCaseCount: number;
}

export interface ReleaseSignature {
  readonly signerRole:
    'ENGINEERING_LEAD' | 'SCIENTIFIC_SAFETY_OFFICER' | 'CLINICAL_AUTHORITY' | 'QUALITY_GOVERNANCE';
  readonly signerName: string;
  readonly signerEmail: string;
  readonly keyId: string;
  readonly algorithm: 'Ed25519' | 'RSA-PSS-SHA256' | 'ECDSA-P256-SHA256';
  readonly signature: string;
  readonly signedAt: string;
  readonly signingComment?: string;
}

export interface MagniomReleaseManifestV2 {
  readonly release_id: string;
  readonly application_release: string;
  readonly source_commit: string;
  readonly database_migration_version: string;
  readonly scientific_policy_release_id: string;
  readonly evidence_library_release_id: string;
  readonly target_engine_release_id: string;
  readonly indication_modules: readonly IndicationModuleManifestEntry[];
  readonly measurement_providers: readonly (SubsystemReleaseRef | ComponentReleaseRef)[];
  readonly reliability_methods: readonly (SubsystemReleaseRef | ComponentReleaseRef)[];
  readonly normative_models?: readonly (SubsystemReleaseRef | ComponentReleaseRef)[];
  readonly atlas_releases?: readonly (SubsystemReleaseRef | ComponentReleaseRef)[];
  readonly efield_releases?: readonly (SubsystemReleaseRef | ComponentReleaseRef)[];
  readonly sbom_digests: readonly string[];
  readonly test_evidence_digest: string;
  readonly manifest_sha256: string;
  readonly signatures: readonly ReleaseSignature[];
  readonly generated_at: string;
  readonly status:
    'DRAFT_CANDIDATE' | 'VERIFICATION_QUALIFIED' | 'VALIDATION_FROZEN' | 'CLINICAL_RELEASE_ACTIVE';
}

export interface ClinicalReleasePackage {
  readonly id: string;
  readonly releaseManifest: MagniomReleaseManifestV2;
  readonly approvedIndications: readonly string[];
  readonly regulatoryDossierRef: string;
  readonly clinicalSafetyDeclaration: string;
  readonly signatures: readonly ReleaseSignature[];
  readonly activeSince: string;
}

export interface ModuleKillSwitchState {
  readonly indicationCode: string;
  readonly isSuspended: boolean;
  readonly suspendedAt?: string;
  readonly suspendedBy?: string;
  readonly reason?: string;
  readonly auditEventId?: string;
}
