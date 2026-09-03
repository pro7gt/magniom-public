/**
 * MAGNIOM Release Model v2 Zod Schemas
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§4-10, §131-134, §183-184)
 */

import { z } from 'zod';
import { MagniomModeSchema } from './schemas.js';
import { ModuleQualificationLevelSchema, ComponentReleaseRefSchema } from './v2-schemas.js';

export const Sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/i, 'Must be a valid 64-character SHA-256 hexadecimal string');

export const SubsystemReleaseRefSchema = z.object({
  componentId: z.string().min(1),
  name: z.string().min(1),
  semanticVersion: z.string().min(1),
  sha256: Sha256Schema,
  artifactPath: z.string().min(1),
  frozenAt: z.string().datetime().optional(),
});

export const ApplicationReleaseSchema = z.object({
  id: z.string().min(1),
  semanticVersion: z.string().min(1),
  sourceCommit: z.string().min(1),
  buildTimestamp: z.string().datetime(),
  artifacts: z.array(SubsystemReleaseRefSchema),
  dbMigrationHead: z.string().min(1),
});

export const ScientificReleaseSchema = z.object({
  id: z.string().min(1),
  semanticVersion: z.string().min(1),
  scientificPolicyReleaseId: z.string().min(1),
  evidenceLibraryReleaseId: z.string().min(1),
  targetEngineReleaseId: z.string().min(1),
  releaseSha256: Sha256Schema,
  releasedAt: z.string().datetime(),
});

export const IndicationModuleManifestEntrySchema = z.object({
  indication_module_release_id: z.string().min(1),
  indicationCode: z.string().min(1),
  qualification_level: z.union([ModuleQualificationLevelSchema, z.string().min(1)]),
  permitted_modes: z.array(z.union([MagniomModeSchema, z.string().min(1)])),
  plugin_digest: Sha256Schema,
  goldenCaseCount: z.number().int().nonnegative(),
});

export const ReleaseSignatureSchema = z.object({
  signerRole: z.enum([
    'ENGINEERING_LEAD',
    'SCIENTIFIC_SAFETY_OFFICER',
    'CLINICAL_AUTHORITY',
    'QUALITY_GOVERNANCE',
  ]),
  signerName: z.string().min(1),
  signerEmail: z.string().email(),
  keyId: z.string().min(1),
  algorithm: z.enum(['Ed25519', 'RSA-PSS-SHA256', 'ECDSA-P256-SHA256']),
  signature: z.string().min(1),
  signedAt: z.string().datetime(),
  signingComment: z.string().optional(),
});

export const MagniomReleaseManifestV2Schema = z.object({
  release_id: z.string().min(1),
  application_release: z.string().min(1),
  source_commit: z.string().min(1),
  database_migration_version: z.string().min(1),
  scientific_policy_release_id: z.string().min(1),
  evidence_library_release_id: z.string().min(1),
  target_engine_release_id: z.string().min(1),
  indication_modules: z.array(IndicationModuleManifestEntrySchema).min(1),
  measurement_providers: z.array(z.union([SubsystemReleaseRefSchema, ComponentReleaseRefSchema])),
  reliability_methods: z.array(z.union([SubsystemReleaseRefSchema, ComponentReleaseRefSchema])),
  normative_models: z
    .array(z.union([SubsystemReleaseRefSchema, ComponentReleaseRefSchema]))
    .optional(),
  atlas_releases: z
    .array(z.union([SubsystemReleaseRefSchema, ComponentReleaseRefSchema]))
    .optional(),
  efield_releases: z
    .array(z.union([SubsystemReleaseRefSchema, ComponentReleaseRefSchema]))
    .optional(),
  sbom_digests: z.array(Sha256Schema),
  test_evidence_digest: Sha256Schema,
  manifest_sha256: Sha256Schema,
  signatures: z.array(ReleaseSignatureSchema),
  generated_at: z.string().datetime(),
  status: z.enum([
    'DRAFT_CANDIDATE',
    'VERIFICATION_QUALIFIED',
    'VALIDATION_FROZEN',
    'CLINICAL_RELEASE_ACTIVE',
  ]),
});

export const ClinicalReleasePackageSchema = z.object({
  id: z.string().min(1),
  releaseManifest: MagniomReleaseManifestV2Schema,
  approvedIndications: z.array(z.string().min(1)).min(1),
  regulatoryDossierRef: z.string().min(1),
  clinicalSafetyDeclaration: z.string().min(10),
  signatures: z.array(ReleaseSignatureSchema).min(2),
  activeSince: z.string().datetime(),
});

export const ModuleKillSwitchStateSchema = z.object({
  indicationCode: z.string().min(1),
  isSuspended: z.boolean(),
  suspendedAt: z.string().datetime().optional(),
  suspendedBy: z.string().optional(),
  reason: z.string().optional(),
  auditEventId: z.string().optional(),
});

export function validateReleaseManifestV2(data: unknown) {
  return MagniomReleaseManifestV2Schema.safeParse(data);
}
