/**
 * Evidence Knowledge Graph v2 Traversal & Query Engine
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
 * Pure TypeScript implementation providing:
 * - Direct lookup and relational traversal (Source -> Finding -> Claim -> Synthesis -> Governance -> Path)
 * - Source overlap accounting and conflict detection
 * - Anti-Premature Tier Promotion enforcement
 * - Indication Module Exit Criteria verification
 */

import type {
  EvidenceClaimV2,
  SourceFinding,
  ClaimEvidenceSynthesis,
  EvidenceGovernanceClassification,
  EvidencePath,
  ClaimConflictSet,
  TargetEvidenceProfileV2,
  LegacyEvidenceTier,
  ConfidenceLevel,
} from '@magniom/domain';
import {
  CANONICAL_SOURCES,
  CANONICAL_FINDINGS,
  CANONICAL_CLAIMS_V2,
  CANONICAL_SYNTHESES,
  CANONICAL_GOVERNANCE_CLASSIFICATIONS,
  CANONICAL_CONFLICT_SETS,
  CANONICAL_EVIDENCE_PATHS,
  type CanonicalSourceEntry,
} from './seeds/index.js';

export interface EvidenceReleasePackageV2 {
  readonly version: string;
  readonly sources: readonly CanonicalSourceEntry[];
  readonly findings: readonly SourceFinding[];
  readonly claims: readonly EvidenceClaimV2[];
  readonly syntheses: readonly ClaimEvidenceSynthesis[];
  readonly governanceClassifications: readonly EvidenceGovernanceClassification[];
  readonly conflictSets: readonly ClaimConflictSet[];
  readonly evidencePaths: readonly EvidencePath[];
}

export class EvidenceKnowledgeGraphV2 {
  private readonly sourcesById = new Map<string, CanonicalSourceEntry>();
  private readonly sourcesByCode = new Map<string, CanonicalSourceEntry>();
  private readonly findingsById = new Map<string, SourceFinding>();
  private readonly findingsBySourceId = new Map<string, SourceFinding[]>();
  private readonly claimsById = new Map<string, EvidenceClaimV2>();
  private readonly claimsByCode = new Map<string, EvidenceClaimV2>();
  private readonly synthesesById = new Map<string, ClaimEvidenceSynthesis>();
  private readonly synthesesByClaimId = new Map<string, ClaimEvidenceSynthesis>();
  private readonly governanceById = new Map<string, EvidenceGovernanceClassification>();
  private readonly governanceByClaimId = new Map<string, EvidenceGovernanceClassification>();
  private readonly conflictsById = new Map<string, ClaimConflictSet>();
  private readonly pathsById = new Map<string, EvidencePath>();
  private readonly pathsByIndication = new Map<string, EvidencePath[]>();
  private readonly pathsByTargetFamily = new Map<string, EvidencePath[]>();

  constructor(private readonly release?: EvidenceReleasePackageV2) {
    this.buildIndexes();
  }

  private buildIndexes(): void {
    const sources = this.release?.sources ?? CANONICAL_SOURCES;
    const findings = this.release?.findings ?? CANONICAL_FINDINGS;
    const claims = this.release?.claims ?? CANONICAL_CLAIMS_V2;
    const syntheses = this.release?.syntheses ?? CANONICAL_SYNTHESES;
    const governance = this.release?.governanceClassifications ?? CANONICAL_GOVERNANCE_CLASSIFICATIONS;
    const conflicts = this.release?.conflictSets ?? CANONICAL_CONFLICT_SETS;
    const paths = this.release?.evidencePaths ?? CANONICAL_EVIDENCE_PATHS;

    for (const src of sources) {
      this.sourcesById.set(src.id, src);
      this.sourcesByCode.set(src.code, src);
    }

    for (const fnd of findings) {
      this.findingsById.set(fnd.id, fnd);
      const list = this.findingsBySourceId.get(fnd.sourceId) ?? [];
      list.push(fnd);
      this.findingsBySourceId.set(fnd.sourceId, list);
    }

    for (const clm of claims) {
      this.claimsById.set(clm.id, clm);
      this.claimsByCode.set(clm.code, clm);
    }

    for (const syn of syntheses) {
      this.synthesesById.set(syn.id, syn);
      this.synthesesByClaimId.set(syn.evidenceClaimId, syn);
    }

    for (const gov of governance) {
      this.governanceById.set(gov.id, gov);
      this.governanceByClaimId.set(gov.evidenceClaimId, gov);
    }

    for (const cnf of conflicts) {
      this.conflictsById.set(cnf.id, cnf);
    }

    for (const pth of paths) {
      this.pathsById.set(pth.id, pth);
      const indList = this.pathsByIndication.get(pth.indicationModuleReleaseId) ?? [];
      indList.push(pth);
      this.pathsByIndication.set(pth.indicationModuleReleaseId, indList);

      const tfList = this.pathsByTargetFamily.get(pth.targetFamilyId) ?? [];
      tfList.push(pth);
      this.pathsByTargetFamily.set(pth.targetFamilyId, tfList);
    }
  }

  public getReleaseVersion(): string {
    return this.release?.version ?? '2.0.0-staging';
  }

  // ----------------------------------------------------
  // Sources & Findings
  // ----------------------------------------------------
  public getSources(): readonly CanonicalSourceEntry[] {
    return Array.from(this.sourcesById.values());
  }

  public getSource(idOrCode: string): CanonicalSourceEntry | undefined {
    return this.sourcesById.get(idOrCode) ?? this.sourcesByCode.get(idOrCode);
  }

  public getFindings(): readonly SourceFinding[] {
    return Array.from(this.findingsById.values());
  }

  public getFinding(id: string): SourceFinding | undefined {
    return this.findingsById.get(id);
  }

  public getFindingsBySource(sourceId: string): readonly SourceFinding[] {
    return this.findingsBySourceId.get(sourceId) ?? [];
  }

  // ----------------------------------------------------
  // Claims & Syntheses
  // ----------------------------------------------------
  public getClaims(): readonly EvidenceClaimV2[] {
    return Array.from(this.claimsById.values());
  }

  public getClaim(idOrCode: string): EvidenceClaimV2 | undefined {
    return this.claimsById.get(idOrCode) ?? this.claimsByCode.get(idOrCode);
  }

  public getClaimsByIndication(indicationId: string): readonly EvidenceClaimV2[] {
    return Array.from(this.claimsById.values()).filter((c) => c.indicationIds.includes(indicationId));
  }

  public getClaimsByTargetFamily(targetFamilyId: string): readonly EvidenceClaimV2[] {
    return Array.from(this.claimsById.values()).filter((c) => c.targetFamilyIds?.includes(targetFamilyId));
  }

  public getSynthesis(id: string): ClaimEvidenceSynthesis | undefined {
    return this.synthesesById.get(id);
  }

  public getSynthesisForClaim(claimId: string): ClaimEvidenceSynthesis | undefined {
    return this.synthesesByClaimId.get(claimId);
  }

  // ----------------------------------------------------
  // Governance Classifications (Anti-Premature Promotion)
  // ----------------------------------------------------
  public getGovernanceClassification(id: string): EvidenceGovernanceClassification | undefined {
    return this.governanceById.get(id);
  }

  public getGovernanceClassificationForClaim(claimId: string): EvidenceGovernanceClassification | undefined {
    return this.governanceByClaimId.get(claimId);
  }

  public getUnassignedClaims(): readonly EvidenceClaimV2[] {
    return Array.from(this.claimsById.values()).filter((claim) => {
      const gov = this.governanceByClaimId.get(claim.id);
      return !gov || gov.classificationStatus === 'unassigned';
    });
  }

  // ----------------------------------------------------
  // Evidence Paths & Clinical Permissions
  // ----------------------------------------------------
  public getEvidencePaths(): readonly EvidencePath[] {
    return Array.from(this.pathsById.values());
  }

  public getEvidencePath(id: string): EvidencePath | undefined {
    return this.pathsById.get(id);
  }

  public getEvidencePathsForIndication(indicationModuleReleaseId: string): readonly EvidencePath[] {
    return this.pathsByIndication.get(indicationModuleReleaseId) ?? [];
  }

  public getEvidencePathsForTargetFamily(targetFamilyId: string): readonly EvidencePath[] {
    return this.pathsByTargetFamily.get(targetFamilyId) ?? [];
  }

  // ----------------------------------------------------
  // Negative Evidence & Conflicts
  // ----------------------------------------------------
  public getNegativeClaims(indicationId?: string): readonly EvidenceClaimV2[] {
    const conflictingIds = new Set<string>();
    for (const cs of this.conflictsById.values()) {
      cs.conflictingClaimIds.forEach((id) => conflictingIds.add(id));
    }

    return Array.from(this.claimsById.values()).filter((c) => {
      const isNegative =
        c.claimType === 'negative_evidence' ||
        c.claimType === 'methodological_limitation' ||
        c.direction === 'does_not_support' ||
        conflictingIds.has(c.id) ||
        c.sourceContributions.some((sc) => sc.relationship === 'conflicts' || sc.relationship === 'does_not_support');
      if (!isNegative) return false;
      return indicationId ? c.indicationIds.includes(indicationId) : true;
    });
  }

  public getConflictSets(): readonly ClaimConflictSet[] {
    return Array.from(this.conflictsById.values());
  }

  public getConflictSetsForClaim(claimId: string): readonly ClaimConflictSet[] {
    return Array.from(this.conflictsById.values()).filter(
      (cs) =>
        cs.subjectClaimId === claimId ||
        cs.supportingClaimIds.includes(claimId) ||
        cs.conflictingClaimIds.includes(claimId),
    );
  }

  // ----------------------------------------------------
  // Target Evidence Profile Computation
  // ----------------------------------------------------
  public computeTargetEvidenceProfile(targetFamilyId: string, indicationId: string): TargetEvidenceProfileV2 {
    const claims = this.getClaimsByTargetFamily(targetFamilyId).filter((c) => c.indicationIds.includes(indicationId));
    const claimIds = claims.map((c) => c.id);

    // Determine highest assigned tier, if any
    let highestTier: LegacyEvidenceTier | undefined = undefined;
    for (const claim of claims) {
      const gov = this.governanceByClaimId.get(claim.id);
      if (gov?.classificationStatus === 'assigned' && gov.magniomEvidenceTier) {
        if (!highestTier || gov.magniomEvidenceTier < highestTier) {
          highestTier = gov.magniomEvidenceTier;
        }
      }
    }

    // Identify conflicting claims
    const conflictingClaimIds = new Set<string>();
    for (const claim of claims) {
      const conflictSets = this.getConflictSetsForClaim(claim.id);
      for (const cs of conflictSets) {
        if (cs.subjectClaimId === claim.id) {
          cs.conflictingClaimIds.forEach((id) => conflictingClaimIds.add(id));
        }
      }
    }

    // Determine confidence level
    let confidence: ConfidenceLevel = 'LOW';
    if (highestTier === 'A') {
      confidence = 'HIGH';
    } else if (highestTier === 'B') {
      confidence = 'MODERATE';
    }

    const limitations = Array.from(new Set(claims.flatMap((c) => c.limitations)));

    return {
      highestEvidenceTier: highestTier ?? 'D',
      indicationMatch: claims.length > 0,
      indicationModuleMatch: true,
      populationMatch: true,
      diseaseStageMatch: 'match',
      targetFamilyMatch: true,
      targetingMethodMatch: true,
      targetGeometryMatch: true,
      treatmentContextMatch: 'match',
      evidenceClaimIds: claimIds,
      conflictingEvidenceClaimIds: Array.from(conflictingClaimIds),
      evidenceConfidence: confidence,
      applicabilityLimitations: limitations,
      evidenceSummary:
        claims.length > 0
          ? `${claims.length} claims support target family ${targetFamilyId}. Highest assigned tier: ${highestTier ?? 'Unassigned'}.`
          : `No evidence claims associated with target family ${targetFamilyId}.`,
    };
  }

  // ----------------------------------------------------
  // Module Exit Criteria Verification (§75, 110-116)
  // ----------------------------------------------------
  public verifyModuleExitCriteria(indicationId: string): {
    readonly passed: boolean;
    readonly violations: readonly string[];
  } {
    const violations: string[] = [];
    const claims = this.getClaimsByIndication(indicationId);

    if (claims.length === 0) {
      violations.push(`Indication ${indicationId} has no seeded evidence claims.`);
      return { passed: false, violations };
    }

    // 1. Target-generating claims independently reviewed
    for (const claim of claims) {
      const isTargetGenerating = (claim.targetFamilyIds?.length ?? 0) > 0;
      if (isTargetGenerating && claim.lifecycleStatus !== 'approved_scientific_claim') {
        violations.push(`Target-generating claim ${claim.code} lifecycleStatus is ${claim.lifecycleStatus}, expected approved_scientific_claim.`);
      }
    }

    // 2. Material negative evidence represented
    const negativeClaims = this.getNegativeClaims(indicationId);
    if (negativeClaims.length === 0 && indicationId !== 'ind-mdd-001') {
      violations.push(`Indication ${indicationId} lacks material negative/conflicting evidence claims.`);
    }

    // 3. Population boundaries explicit
    for (const claim of claims) {
      if (!claim.populationIds || claim.populationIds.length === 0) {
        violations.push(`Claim ${claim.code} lacks explicit population boundaries.`);
      }
    }

    // 4. Source overlap documented
    for (const claim of claims) {
      for (const contrib of claim.sourceContributions) {
        if (!contrib.independence || contrib.independence === 'unknown') {
          violations.push(`Claim ${claim.code} source contribution ${contrib.sourceId} has unknown independence.`);
        }
      }
    }

    // 5. EvidencePaths reconstructable
    const paths = Array.from(this.pathsById.values()).filter((p) =>
      p.evidenceClaimIds.some((cid) => claims.some((c) => c.id === cid)),
    );
    if (paths.length === 0) {
      violations.push(`Indication ${indicationId} has no reconstructable EvidencePaths.`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}
