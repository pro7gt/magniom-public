import { z } from 'zod';

export const MagniomModeSchema = z.enum(['RESEARCH', 'CLINICAL', 'VALIDATION']);

export const CandidateRoleSchema = z.enum([
  'PRIMARY_1',
  'PRIMARY_2',
  'PRIMARY_3',
  'ADDITIONAL_A',
  'ADDITIONAL_B',
  'RESERVE',
]);

export const EvidenceTierSchema = z.enum(['T1', 'T2', 'T3', 'T4', 'T_EXP']);

export const TargetMethodSchema = z.enum([
  'EVIDENCE_ONLY_PRIOR',
  'STRUCTURAL_ANATOMICAL',
  'CONNECTOME_REFINED',
  'ELECTRIC_FIELD_OPTIMIZED',
]);

export const MniCoordinateSchema = z.object({
  space: z.literal('MNI152NLin2009cAsym'),
  x: z.number().min(-100).max(100),
  y: z.number().min(-150).max(100),
  z: z.number().min(-100).max(100),
});

export const SurfaceVertexSchema = z.object({
  space: z.literal('fsLR_32k'),
  hemisphere: z.enum(['L', 'R']),
  vertexIndex: z.number().int().nonnegative(),
  parcelName: z.string().min(1),
});

export const TargetReliabilityProfileSchema = z.object({
  candidateId: z.string().uuid().or(z.string().min(1)),
  scanDurationMinutes: z.number().positive(),
  meanFramewiseDisplacementMm: z.number().nonnegative(),
  retainedFramesPercentage: z.number().min(0).max(100),
  temporalSnr: z.number().positive(),
  splitHalfLocalisationDistanceMm: z.number().nonnegative().optional(),
  overallReliabilityScore: z.number().min(0).max(1),
  isReliableForPersonalisation: z.boolean(),
  warnings: z.array(z.string()),
});

export const TargetCandidateSchema = z.object({
  id: z.string().min(1),
  familyId: z.string().min(1),
  circuitId: z.string().min(1),
  role: CandidateRoleSchema,
  method: TargetMethodSchema,
  evidenceTier: EvidenceTierSchema,
  mniCoordinate: MniCoordinateSchema,
  surfaceVertex: SurfaceVertexSchema.optional(),
  evidenceScore: z.number().min(0).max(1),
  phenotypeConcordanceScore: z.number().min(0).max(1),
  connectomeRefinementScore: z.number().min(0).max(1).optional(),
  overallScore: z.number().min(0).max(1),
  rationale: z.string().min(1),
  contraindicationsOrConflicts: z.array(z.string()),
  isSuppressedOrRedundant: z.boolean(),
});

export const TargetSlateSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  phenotypeSnapshotId: z.string().min(1),
  scientificPolicyVersion: z.string().min(1),
  evidenceReleaseVersion: z.string().min(1),
  generatedAt: z.string().datetime(),
  mode: MagniomModeSchema,
  primaryCandidates: z.array(TargetCandidateSchema).max(3),
  additionalCandidates: z.array(TargetCandidateSchema).max(2),
  suppressedCandidates: z.array(TargetCandidateSchema),
  abstentionReason: z.string().optional(),
  deterministicManifestHash: z.string().length(64),
});

export const DecisionTypeSchema = z.enum([
  'ACCEPTED_PRIMARY',
  'ACCEPTED_ADDITIONAL',
  'SUBSTITUTED_ALTERNATIVE',
  'MANUAL_OVERRIDE',
  'DEFERRED',
  'REJECTED',
]);

export const ClinicianDecisionSchema = z.object({
  id: z.string().min(1),
  slateId: z.string().min(1),
  clinicianId: z.string().min(1),
  decisionType: DecisionTypeSchema,
  selectedCandidateIds: z.array(z.string()),
  manualOverrideDetails: z
    .object({
      customCoordinate: MniCoordinateSchema.optional(),
      clinicalRationale: z.string().min(10),
    })
    .optional(),
  reviewedCounterfactuals: z.boolean(),
  reviewedConflictingEvidence: z.boolean(),
  decidedAt: z.string().datetime(),
  digitalSignatureHash: z.string().min(32),
  isImmutable: z.literal(true),
});
