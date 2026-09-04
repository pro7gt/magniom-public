/**
 * Presentation Layer Adapters for Evidence Knowledge Graph v2
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
 * (§126 Claim Review UI, §127 Clinician Evidence UI)
 */

import type { EvidenceKnowledgeGraphV2 } from '@magniom/evidence';

export interface ClaimReviewViewModel {
  readonly claimId: string;
  readonly claimCode: string;
  readonly statement: string;
  readonly lifecycleStatus: string;
  readonly claimType: string;
  readonly direction: string;
  readonly populations: readonly string[];
  readonly targetFamilies: readonly string[];
  readonly targetingStrategies: readonly string[];
  readonly targetGeometries: readonly string[];
  readonly outcomes: readonly string[];
  readonly treatmentContexts: readonly string[];
  readonly supportingEvidence: readonly {
    readonly sourceId: string;
    readonly citation: string;
    readonly findingStatements: readonly string[];
    readonly relevance: string;
    readonly independence: string;
  }[];
  readonly conflictingEvidence: readonly {
    readonly claimId: string;
    readonly claimCode: string;
    readonly conflictType: string;
    readonly statement: string;
    readonly reconciliationStatus: string;
  }[];
  readonly primaryStudyOverlap: readonly {
    readonly sourceId: string;
    readonly independence: string;
    readonly note?: string | undefined;
  }[];
  readonly evidenceDimensions: {
    readonly directness: string;
    readonly replication: string;
    readonly consistency: string;
    readonly targetSpecificity: string;
    readonly clinicalApplicability: string;
    readonly treatmentContextDependence: string;
  };
  readonly applicabilityConstraints: readonly string[];
  readonly limitations: readonly string[];
  readonly proposedGovernanceClassification: {
    readonly status: string;
    readonly recommendedTier?: string | undefined;
    readonly permittedRoles?: Record<string, boolean> | undefined;
    readonly rationale?: string | undefined;
  };
  readonly reviewActions: {
    readonly canRecordAgreement: boolean;
    readonly canRecordDisagreement: boolean;
    readonly canFlagOverlap: boolean;
    readonly canRequestAdjudication: boolean;
  };
}

export interface ClinicianEvidenceViewModel {
  readonly targetFamilyId: string;
  readonly targetFamilyName: string;
  readonly indicationId: string;
  readonly whatIsSupported: string;
  readonly howDirectly: string;
  readonly byWhichTargetAndProtocol: {
    readonly targetFamily: string;
    readonly permittedGeometries: readonly string[];
    readonly strategies: readonly string[];
  };
  readonly inWhom: readonly string[];
  readonly whatConflicts: readonly string[];
  readonly whatRemainsUncertain: readonly string[];
  readonly permittedClinicalRole: string;
  readonly hasAssignedTier: boolean;
  readonly assignedTierBadge?: string | undefined;
  readonly pathStatus: string;
  readonly isClinicallyPermitted: boolean;
  readonly researchOnlyWarning?: string | undefined;
}

/**
 * §126. Claim Review UI Adapter
 * Structures evidence claims for reviewer scrutiny, making disagreement and overlap explicit.
 */
export function toClaimReviewViewModel(
  claimIdOrCode: string,
  graph: EvidenceKnowledgeGraphV2,
): ClaimReviewViewModel {
  const claim = graph.getClaim(claimIdOrCode);
  if (!claim) {
    throw new Error(`Claim not found in evidence knowledge graph: ${claimIdOrCode}`);
  }

  const synthesis = graph.getSynthesisForClaim(claim.id);
  const gov = graph.getGovernanceClassificationForClaim(claim.id);
  const conflictSets = graph.getConflictSetsForClaim(claim.id);

  const supportingSources = claim.sourceContributions
    .filter(sc => sc.relationship === 'supports' || sc.relationship === 'partially_supports')
    .map(sc => {
      const src = graph.getSource(sc.sourceId);
      const findings = graph.getFindingsBySource(sc.sourceId);
      return {
        sourceId: sc.sourceId,
        citation: src?.citationText ?? sc.sourceId,
        findingStatements: findings.map(f => f.findingStatement),
        relevance: sc.relevance,
        independence: sc.independence,
      };
    });

  const conflictingEvidenceList: {
    claimId: string;
    claimCode: string;
    conflictType: string;
    statement: string;
    reconciliationStatus: string;
  }[] = [];

  for (const cs of conflictSets) {
    const conflictingIds =
      cs.subjectClaimId === claim.id ? cs.conflictingClaimIds : [cs.subjectClaimId];
    for (const cId of conflictingIds) {
      const other = graph.getClaim(cId);
      if (other && !conflictingEvidenceList.some(e => e.claimId === other.id)) {
        conflictingEvidenceList.push({
          claimId: other.id,
          claimCode: other.code,
          conflictType: cs.conflictType,
          statement: other.statement,
          reconciliationStatus: cs.reconciliationStatus,
        });
      }
    }
  }

  const overlapList = claim.sourceContributions.map(sc => ({
    sourceId: sc.sourceId,
    independence: sc.independence,
    note: sc.curatorNote,
  }));

  const paths = graph.getEvidencePaths().filter(p => p.evidenceClaimIds.includes(claim.id));
  const geometries = Array.from(new Set(paths.map(p => p.targetGeometryType)));
  const strategies = Array.from(new Set(paths.map(p => p.targetingStrategyId)));
  const family = claim.targetFamilyIds?.[0]
    ? graph.getTargetFamily(claim.targetFamilyIds[0])
    : undefined;
  const contexts = Array.from(
    new Set([
      ...(claim.treatmentContextRequirementIds ?? []),
      ...paths.flatMap(p => p.treatmentContextRequirementIds ?? []),
      ...(family?.treatmentContextRequirementIds ?? []),
    ]),
  );

  return {
    claimId: claim.id,
    claimCode: claim.code,
    statement: claim.statement,
    lifecycleStatus: claim.lifecycleStatus,
    claimType: claim.claimType,
    direction: claim.direction,
    populations: claim.populationIds,
    targetFamilies: claim.targetFamilyIds ?? [],
    targetingStrategies: strategies.length > 0 ? strategies : (claim.targetingStrategyIds ?? []),
    targetGeometries: geometries,
    outcomes: claim.outcomeDomainIds,
    treatmentContexts: contexts,
    supportingEvidence: supportingSources,
    conflictingEvidence: conflictingEvidenceList,
    primaryStudyOverlap: overlapList,
    evidenceDimensions: {
      directness: synthesis?.directness ?? 'uncertain',
      replication: synthesis?.replication ?? 'not_assessable',
      consistency: synthesis?.consistency ?? 'uncertain',
      targetSpecificity: synthesis?.targetSpecificity ?? 'uncertain',
      clinicalApplicability: synthesis?.clinicalApplicability ?? 'uncertain',
      treatmentContextDependence: synthesis?.treatmentContextDependence ?? 'unknown',
    },
    applicabilityConstraints: claim.applicabilityConstraints,
    limitations: claim.limitations,
    proposedGovernanceClassification: {
      status: gov?.classificationStatus ?? 'unassigned',
      recommendedTier: gov?.magniomEvidenceTier,
      permittedRoles: gov?.permittedRoles as Record<string, boolean> | undefined,
      rationale: gov?.rationale,
    },
    reviewActions: {
      canRecordAgreement: true,
      canRecordDisagreement: true,
      canFlagOverlap: true,
      canRequestAdjudication: true,
    },
  };
}

/**
 * §127. Clinician Evidence UI Adapter
 * Answers clinical questions directly rather than leading with an isolated Evidence Tier badge.
 */
export function toClinicianEvidenceViewModel(
  targetFamilyId: string,
  indicationId: string,
  graph: EvidenceKnowledgeGraphV2,
): ClinicianEvidenceViewModel {
  const why = graph.queryWhyThisTarget(targetFamilyId, indicationId);
  const family = graph.getTargetFamily(targetFamilyId);
  const primaryClaim = why.strongestDirectSupport[0];
  const primaryPath = why.evidencePaths[0];

  const whatIsSupported = primaryClaim
    ? primaryClaim.statement
    : `Literature associations documented for ${family?.name ?? targetFamilyId}`;

  const howDirectly =
    why.evidencePaths.length > 0
      ? `Supported via ${why.evidencePaths.length} structured evidence paths (${primaryPath?.targetGeometryType ?? 'point'} geometry)`
      : 'Indirect / Staging synthesis';

  const conflictStrings = why.materialConflicts.flatMap(cs => {
    return cs.conflictingClaimIds.map(cid => {
      const c = graph.getClaim(cid);
      return `[${cs.conflictType}] ${c?.statement ?? cid}`;
    });
  });

  const isClinical = primaryPath?.pathStatus === 'clinical_permitted';
  const isResearch =
    primaryPath?.pathStatus === 'research_permitted' || family?.governanceStatus === 'research';

  let permittedRole = 'Staging / Validation Only (No Clinical Authority)';
  if (isClinical) {
    permittedRole = 'Primary / Secondary Clinical Candidate Generation Permitted';
  } else if (isResearch) {
    permittedRole = 'Research Mode Candidate Generation Only (Clinical Signing Prohibited)';
  }

  return {
    targetFamilyId,
    targetFamilyName: family?.name ?? targetFamilyId,
    indicationId,
    whatIsSupported,
    howDirectly,
    byWhichTargetAndProtocol: {
      targetFamily: family?.name ?? targetFamilyId,
      permittedGeometries: why.targetGeometries,
      strategies: why.targetingStrategies,
    },
    inWhom: why.populationApplicability,
    whatConflicts:
      conflictStrings.length > 0 ? conflictStrings : ['No material conflicting evidence recorded'],
    whatRemainsUncertain: why.limitationsAndUncertainties,
    permittedClinicalRole: permittedRole,
    hasAssignedTier: Boolean(why.assignedTier),
    assignedTierBadge: why.assignedTier ? `Tier ${why.assignedTier}` : 'Tier Unassigned',
    pathStatus: primaryPath?.pathStatus ?? 'staging',
    isClinicallyPermitted: isClinical,
    researchOnlyWarning: isResearch
      ? 'WARNING: This target family operates under Research Staging. It cannot be promoted to clinical treatment.'
      : undefined,
  };
}
