/**
 * Target Slate & Decision Persistence Transformers
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Sections 50-60, 77-78
 */

import type {
  TargetSlate,
  TargetCandidate,
  ClinicianDecision,
  FinalTarget,
  PublishTargetSlateInput,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';

export function serializeTargetCandidateForDatabase(
  candidate: TargetCandidate,
  options: {
    organisationId: string;
    caseId: string;
    phenotypeSnapshotId: string;
    evidenceReleaseId: string;
  },
) {
  return {
    organisationId: options.organisationId,
    caseId: options.caseId,
    phenotypeSnapshotId: options.phenotypeSnapshotId,
    evidenceReleaseId: options.evidenceReleaseId,
    candidateCode: candidate.id,
    targetFamilyCode: candidate.familyId,
    circuitCode: candidate.circuitId,
    candidateRole: candidate.role,
    targetMethod: candidate.method,
    evidenceTier: candidate.evidenceTier,
    isSuppressedOrRedundant: candidate.isSuppressedOrRedundant,
    suppressionReason: candidate.suppressionReason,
    mniCoordinate: candidate.mniCoordinate,
    surfaceVertex: candidate.surfaceVertex,
    evidenceScore: candidate.evidenceScore,
    phenotypeConcordanceScore: candidate.phenotypeConcordanceScore,
    connectomeRefinementScore: candidate.connectomeRefinementScore,
    overallScore: candidate.overallScore,
    rationale: candidate.rationale,
    counterarguments: candidate.counterarguments ?? [
      'Target location subject to empirical inter-individual variance.',
    ],
    contraindicationsOrConflicts: candidate.contraindicationsOrConflicts ?? [],
    convergenceProfile: candidate.convergenceProfile,
    rankingFeatures: candidate.rankingFeatures,
    metrics: {
      evidenceScore: candidate.evidenceScore,
      phenotypeScore: candidate.phenotypeConcordanceScore,
      overallScore: candidate.overallScore,
    },
    explanation: {
      rationale: candidate.rationale,
      evidenceTier: candidate.evidenceTier,
      role: candidate.role,
    },
  };
}

export function serializeTargetSlateForDatabase(
  slate: TargetSlate,
  options: {
    organisationId: string;
    caseId: string;
    evidenceReleaseId?: string;
  },
): PublishTargetSlateInput {
  const allCandidates: TargetCandidate[] = [
    ...slate.primaryCandidates,
    ...slate.additionalCandidates,
    ...slate.suppressedCandidates,
  ];

  const evidenceReleaseId = options.evidenceReleaseId ?? 'e0000000-0000-0000-0000-000000000001';

  const candidatesPayload = allCandidates.map(cand =>
    serializeTargetCandidateForDatabase(cand, {
      organisationId: options.organisationId,
      caseId: options.caseId,
      phenotypeSnapshotId: slate.phenotypeSnapshotId,
      evidenceReleaseId,
    }),
  );

  const outputPayload = {
    id: slate.id,
    caseId: options.caseId,
    phenotypeSnapshotId: slate.phenotypeSnapshotId,
    scientificPolicyVersion: slate.scientificPolicyVersion,
    evidenceReleaseVersion: slate.evidenceReleaseVersion,
    generatedAt: slate.generatedAt,
    mode: slate.mode,
    personalisationQualification: slate.personalisationQualification,
    clinicalCoverageProfile: slate.clinicalCoverageProfile,
    counterfactualSummary: slate.counterfactualSummary,
    abstentionProfile: slate.abstentionProfile,
    abstentionReason: slate.abstentionReason,
    deterministicManifestHash: slate.deterministicManifestHash,
  };

  const inputSha256 = computeSha256({
    caseId: options.caseId,
    phenotypeSnapshotId: slate.phenotypeSnapshotId,
    policyVersion: slate.scientificPolicyVersion,
    evidenceVersion: slate.evidenceReleaseVersion,
  });

  return {
    caseId: options.caseId,
    phenotypeSnapshotId: slate.phenotypeSnapshotId,
    evidenceReleaseId,
    engineVersion: '1.0.0',
    scientificPolicyVersion: slate.scientificPolicyVersion,
    evidenceReleaseVersion: slate.evidenceReleaseVersion,
    inputSha256,
    deterministicManifestHash: slate.deterministicManifestHash,
    payloadSha256: slate.deterministicManifestHash,
    outputPayload,
    candidates: candidatesPayload,
    mode: slate.mode,
  };
}

export function computeSignedDecisionManifest(
  decision: ClinicianDecision,
  finalTargets: readonly FinalTarget[],
  clinicianDetails?: { fullName?: string; registrationIdentifier?: string },
): {
  canonicalPayload: Record<string, unknown>;
  digitalSignatureHash: string;
} {
  const canonicalPayload = {
    decisionId: decision.id,
    caseId: decision.caseId,
    slateId: decision.slateId,
    clinicianId: decision.clinicianId,
    clinicianName: clinicianDetails?.fullName ?? 'TMS Specialist',
    registrationIdentifier: clinicianDetails?.registrationIdentifier ?? 'MED-TMS-001',
    decisionType: decision.decisionType,
    overallReasoning: decision.overallReasoning ?? '',
    magniomInfluence: decision.magniomInfluence ?? 'none',
    disagreementWithMagniom: decision.disagreementWithMagniom,
    reviewedCounterfactuals: decision.reviewedCounterfactuals,
    reviewedConflictingEvidence: decision.reviewedConflictingEvidence,
    attestationStatement: decision.attestation?.statement ?? '',
    finalTargets: finalTargets.map(t => ({
      sequenceOrder: t.sequenceOrder,
      source: t.source,
      sourceCandidateId: t.sourceCandidateId,
      targetRegion: t.targetRegion,
      therapeuticObjectives: t.therapeuticObjectives,
    })),
    signedAt: decision.decidedAt,
  };

  const digitalSignatureHash = computeSha256(canonicalPayload);

  return {
    canonicalPayload,
    digitalSignatureHash,
  };
}
