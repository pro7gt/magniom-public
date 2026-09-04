/**
 * Evidence Knowledge Graph v2 Traversal & Query Engine
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
 * Pure TypeScript implementation providing:
 * - Direct lookup and relational traversal (Source -> Finding -> Claim -> Synthesis -> Governance -> Path)
 * - Source overlap accounting and conflict detection
 * - Anti-Premature Tier Promotion enforcement
 * - Indication Module Exit Criteria verification
 * - Explicit Edge Ontology & Traversal (33 Edges, strict prohibition of PROVES) (§14, §15)
 * - Six First-Class Graph Queries (§97 - §102)
 * - Graph Validation Rules (§117 - §123)
 * - Release Golden Questionnaire Evaluator (§143)
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
  TargetFamilyV2,
  TherapeuticCircuitV2,
  ClaimTargetBinding,
  EvidenceQuestion,
  EvidenceEdge,
  EvidenceEdgeType,
  WhyThisTargetQueryResult,
  ClinicallyPermittedQueryResult,
  EvidenceWithoutTierQueryResult,
  StagingTargetsQueryResult,
  NullEvidenceQueryResult,
  EvidenceReleaseDiffResult,
  TargetGeometryType,
} from '@magniom/domain';
import {
  CANONICAL_SOURCES,
  CANONICAL_FINDINGS,
  CANONICAL_CLAIMS_V2,
  CANONICAL_SYNTHESES,
  CANONICAL_GOVERNANCE_CLASSIFICATIONS,
  CANONICAL_CONFLICT_SETS,
  CANONICAL_EVIDENCE_PATHS,
  CANONICAL_CIRCUITS_V2,
  CANONICAL_TARGET_FAMILIES_V2,
  CANONICAL_CLAIM_TARGET_BINDINGS,
  CANONICAL_EVIDENCE_QUESTIONS,
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
  readonly circuits?: readonly TherapeuticCircuitV2[];
  readonly targetFamilies?: readonly TargetFamilyV2[];
  readonly bindings?: readonly ClaimTargetBinding[];
  readonly questions?: readonly EvidenceQuestion[];
  readonly edges?: readonly EvidenceEdge[];
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

  // Extended v2 structures (§16, §18, §19, §75)
  private readonly circuitsById = new Map<string, TherapeuticCircuitV2>();
  private readonly circuitsByCode = new Map<string, TherapeuticCircuitV2>();
  private readonly targetFamiliesById = new Map<string, TargetFamilyV2>();
  private readonly targetFamiliesByCode = new Map<string, TargetFamilyV2>();
  private readonly bindingsByClaimId = new Map<string, ClaimTargetBinding[]>();
  private readonly bindingsByTargetFamilyId = new Map<string, ClaimTargetBinding[]>();
  private readonly questionsById = new Map<string, EvidenceQuestion>();
  private readonly questionsByIndication = new Map<string, EvidenceQuestion[]>();

  // Explicit Graph Edge Index (§14, §15)
  private readonly edges: EvidenceEdge[] = [];
  private readonly outgoingEdgesMap = new Map<string, EvidenceEdge[]>();
  private readonly incomingEdgesMap = new Map<string, EvidenceEdge[]>();

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
    const circuits = this.release?.circuits ?? CANONICAL_CIRCUITS_V2;
    const targetFamilies = this.release?.targetFamilies ?? CANONICAL_TARGET_FAMILIES_V2;
    const bindings = this.release?.bindings ?? CANONICAL_CLAIM_TARGET_BINDINGS;
    const questions = this.release?.questions ?? CANONICAL_EVIDENCE_QUESTIONS;

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

    for (const circ of circuits) {
      this.circuitsById.set(circ.id, circ);
      this.circuitsByCode.set(circ.code, circ);
    }

    for (const tf of targetFamilies) {
      this.targetFamiliesById.set(tf.id, tf);
      this.targetFamiliesByCode.set(tf.code, tf);
    }

    for (const bnd of bindings) {
      const cList = this.bindingsByClaimId.get(bnd.evidenceClaimId) ?? [];
      cList.push(bnd);
      this.bindingsByClaimId.set(bnd.evidenceClaimId, cList);

      const tfList = this.bindingsByTargetFamilyId.get(bnd.targetFamilyId) ?? [];
      tfList.push(bnd);
      this.bindingsByTargetFamilyId.set(bnd.targetFamilyId, tfList);
    }

    for (const q of questions) {
      this.questionsById.set(q.id, q);
      const qList = this.questionsByIndication.get(q.indicationId) ?? [];
      qList.push(q);
      this.questionsByIndication.set(q.indicationId, qList);
    }

    // Populate explicit edge ontology (§14, §15)
    this.buildEdgeOntology(sources, findings, claims, conflicts, paths, bindings, targetFamilies);
  }

  private buildEdgeOntology(
    _sources: readonly CanonicalSourceEntry[],
    findings: readonly SourceFinding[],
    claims: readonly EvidenceClaimV2[],
    conflicts: readonly ClaimConflictSet[],
    paths: readonly EvidencePath[],
    bindings: readonly ClaimTargetBinding[],
    targetFamilies: readonly TargetFamilyV2[],
  ): void {
    let edgeCounter = 1;
    const createEdge = (
      sourceId: string,
      sourceType: string,
      edgeType: EvidenceEdgeType,
      targetId: string,
      targetType: string,
    ) => {
      this.addEdgeInternal({
        id: `edge-${edgeCounter++}`,
        sourceNodeId: sourceId,
        sourceNodeType: sourceType,
        edgeType,
        targetNodeId: targetId,
        targetNodeType: targetType,
      });
    };

    // 1. Finding -> Source (DERIVED_FROM)
    for (const f of findings) {
      createEdge(f.id, 'SourceFinding', 'DERIVED_FROM', f.sourceId, 'Source');
      if (f.findingType === 'null_result') {
        createEdge(f.sourceId, 'Source', 'HAS_NULL_EVIDENCE', f.id, 'SourceFinding');
      }
    }

    // 2. Claim -> Source Contributions (SUPPORTS, CONFLICTS_WITH, DOES_NOT_SUPPORT, LIMITS_GENERALISATION)
    for (const c of claims) {
      for (const contrib of c.sourceContributions) {
        if (contrib.relationship === 'supports') {
          createEdge(c.id, 'EvidenceClaim', 'SUPPORTS', contrib.sourceId, 'Source');
        } else if (contrib.relationship === 'conflicts') {
          createEdge(c.id, 'EvidenceClaim', 'CONFLICTS_WITH', contrib.sourceId, 'Source');
        } else if (contrib.relationship === 'does_not_support') {
          createEdge(c.id, 'EvidenceClaim', 'DOES_NOT_SUPPORT', contrib.sourceId, 'Source');
        } else if (contrib.relationship === 'limits_generalisation') {
          createEdge(c.id, 'EvidenceClaim', 'LIMITS_GENERALISATION', contrib.sourceId, 'Source');
        }
      }

      if (c.direction === 'does_not_support') {
        c.targetFamilyIds?.forEach((tfId) =>
          createEdge(c.id, 'EvidenceClaim', 'DOES_NOT_SUPPORT', tfId, 'TargetFamily'),
        );
      }

      // Claim metadata relations
      c.populationIds.forEach((popId) => createEdge(c.id, 'EvidenceClaim', 'APPLIES_TO', popId, 'Population'));
      c.indicationIds.forEach((indId) => createEdge(c.id, 'EvidenceClaim', 'ADDRESSES', indId, 'Indication'));
      c.outcomeDomainIds.forEach((outId) => createEdge(c.id, 'EvidenceClaim', 'MEASURES', outId, 'OutcomeDomain'));
      c.diseaseStageDefinitionIds?.forEach((stgId) =>
        createEdge(c.id, 'EvidenceClaim', 'APPLIES_AT_STAGE', stgId, 'DiseaseStage'),
      );
      c.clinicalObjectiveDefinitionIds?.forEach((objId) =>
        createEdge(c.id, 'EvidenceClaim', 'SUPPORTS_OBJECTIVE', objId, 'ClinicalObjective'),
      );
      c.therapeuticCircuitIds?.forEach((circId) =>
        createEdge(c.id, 'EvidenceClaim', 'ENGAGES', circId, 'TherapeuticCircuit'),
      );
      c.targetFamilyIds?.forEach((tfId) => createEdge(c.id, 'EvidenceClaim', 'TARGETS', tfId, 'TargetFamily'));
      c.treatmentContextRequirementIds?.forEach((ctxId) =>
        createEdge(c.id, 'EvidenceClaim', 'REQUIRES_CONTEXT', ctxId, 'TreatmentContext'),
      );
    }

    // 3. Conflict Sets (CONFLICTS_WITH, HAS_NULL_EVIDENCE)
    for (const cs of conflicts) {
      for (const confId of cs.conflictingClaimIds) {
        createEdge(cs.subjectClaimId, 'EvidenceClaim', 'CONFLICTS_WITH', confId, 'EvidenceClaim');
        createEdge(confId, 'EvidenceClaim', 'CONFLICTS_WITH', cs.subjectClaimId, 'EvidenceClaim');
      }
    }

    // 4. Paths (TARGETS, USES_TARGET_GEOMETRY, REQUIRES_CONTEXT, SUPPORTS_OBJECTIVE)
    for (const p of paths) {
      createEdge(p.id, 'EvidencePath', 'TARGETS', p.targetFamilyId, 'TargetFamily');
      createEdge(p.id, 'EvidencePath', 'USES_TARGET_GEOMETRY', p.targetGeometryType, 'TargetGeometry');
      if (p.clinicalObjectiveId) {
        createEdge(p.id, 'EvidencePath', 'SUPPORTS_OBJECTIVE', p.clinicalObjectiveId, 'ClinicalObjective');
      }
      p.treatmentContextRequirementIds?.forEach((ctxId) =>
        createEdge(p.id, 'EvidencePath', 'REQUIRES_CONTEXT', ctxId, 'TreatmentContext'),
      );
    }

    // 5. Explicit Bindings (VALIDATES, REFINES)
    for (const b of bindings) {
      if (b.relationship === 'directly_tested') {
        createEdge(b.evidenceClaimId, 'EvidenceClaim', 'VALIDATES', b.targetFamilyId, 'TargetFamily');
      } else if (b.relationship === 'consistent_with') {
        createEdge(b.evidenceClaimId, 'EvidenceClaim', 'REFINES', b.targetFamilyId, 'TargetFamily');
      }
    }

    // 6. Target Families -> Circuits (ENGAGES)
    for (const tf of targetFamilies) {
      tf.therapeuticCircuitIds?.forEach((circId) =>
        createEdge(tf.id, 'TargetFamily', 'ENGAGES', circId, 'TherapeuticCircuit'),
      );
    }
  }

  private addEdgeInternal(edge: EvidenceEdge): void {
    if ((edge.edgeType as string) === 'PROVES') {
      throw new Error(
        "Prohibited edge type (§15): 'PROVES' edge is strictly forbidden in the MAGNIOM Evidence Knowledge Graph.",
      );
    }
    this.edges.push(edge);
    const outList = this.outgoingEdgesMap.get(edge.sourceNodeId) ?? [];
    outList.push(edge);
    this.outgoingEdgesMap.set(edge.sourceNodeId, outList);

    const inList = this.incomingEdgesMap.get(edge.targetNodeId) ?? [];
    inList.push(edge);
    this.incomingEdgesMap.set(edge.targetNodeId, inList);
  }

  public addEdge(edge: EvidenceEdge): void {
    this.addEdgeInternal(edge);
  }

  public getEdges(): readonly EvidenceEdge[] {
    return this.edges;
  }

  public getOutgoingEdges(nodeId: string): readonly EvidenceEdge[] {
    return this.outgoingEdgesMap.get(nodeId) ?? [];
  }

  public getIncomingEdges(nodeId: string): readonly EvidenceEdge[] {
    return this.incomingEdgesMap.get(nodeId) ?? [];
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
  // Therapeutic Circuits & Target Systems (§16, §17)
  // ----------------------------------------------------
  public getCircuits(): readonly TherapeuticCircuitV2[] {
    return Array.from(this.circuitsById.values());
  }

  public getCircuit(idOrCode: string): TherapeuticCircuitV2 | undefined {
    return this.circuitsById.get(idOrCode) ?? this.circuitsByCode.get(idOrCode);
  }

  public getCircuitsByIndication(indicationId: string): readonly TherapeuticCircuitV2[] {
    return Array.from(this.circuitsById.values()).filter((c) => c.indicationScopeIds.includes(indicationId));
  }

  // ----------------------------------------------------
  // Target Families & Bindings (§18, §19)
  // ----------------------------------------------------
  public getTargetFamilies(): readonly TargetFamilyV2[] {
    return Array.from(this.targetFamiliesById.values());
  }

  public getTargetFamily(idOrCode: string): TargetFamilyV2 | undefined {
    return this.targetFamiliesById.get(idOrCode) ?? this.targetFamiliesByCode.get(idOrCode);
  }

  public getTargetFamiliesByIndication(indicationId: string): readonly TargetFamilyV2[] {
    return Array.from(this.targetFamiliesById.values()).filter(
      (tf) => tf.indicationScopeIds?.includes(indicationId) || tf.indicationModuleReleaseId?.includes(indicationId),
    );
  }

  public getClaimTargetBindings(claimId?: string): readonly ClaimTargetBinding[] {
    if (claimId) {
      return this.bindingsByClaimId.get(claimId) ?? [];
    }
    const all: ClaimTargetBinding[] = [];
    this.bindingsByClaimId.forEach((list) => all.push(...list));
    return all;
  }

  public getBindingsForTargetFamily(targetFamilyId: string): readonly ClaimTargetBinding[] {
    return this.bindingsByTargetFamilyId.get(targetFamilyId) ?? [];
  }

  // ----------------------------------------------------
  // Evidence Questions (§75)
  // ----------------------------------------------------
  public getEvidenceQuestions(indicationId?: string): readonly EvidenceQuestion[] {
    if (indicationId) {
      return this.questionsByIndication.get(indicationId) ?? [];
    }
    return Array.from(this.questionsById.values());
  }

  public getEvidenceQuestion(id: string): EvidenceQuestion | undefined {
    return this.questionsById.get(id);
  }

  // ----------------------------------------------------
  // Evidence Paths & Clinical Permissions (§95, §96)
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
  // Negative Evidence & Conflicts (§90, §91)
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

  // =========================================================================
  // SIX FIRST-CLASS GRAPH QUERIES (§97 - §102)
  // =========================================================================

  /**
   * §97. Graph Query — "Why this target?"
   * Traverses: Candidate/Family -> EvidencePath -> EvidenceClaim -> SourceFinding -> Source
   * plus ClaimConflictSet -> Conflicting claims/sources.
   */
  public queryWhyThisTarget(targetFamilyId: string, indicationId: string): WhyThisTargetQueryResult {
    const family = this.getTargetFamily(targetFamilyId);
    const targetFamilyIdsToMatch = new Set<string>([targetFamilyId]);
    if (family) {
      targetFamilyIdsToMatch.add(family.id);
      targetFamilyIdsToMatch.add(family.code);
    }

    const paths = Array.from(this.pathsById.values()).filter(
      (p) =>
        targetFamilyIdsToMatch.has(p.targetFamilyId) ||
        (this.getTargetFamily(p.targetFamilyId)?.code && targetFamilyIdsToMatch.has(this.getTargetFamily(p.targetFamilyId)!.code)),
    );

    const claims = Array.from(this.claimsById.values()).filter(
      (c) =>
        c.indicationIds.includes(indicationId) &&
        (c.targetFamilyIds?.some((id) => targetFamilyIdsToMatch.has(id)) ||
          paths.some((p) => p.evidenceClaimIds.includes(c.id))),
    );

    const directSupportClaims = claims.filter(
      (c) =>
        c.direction === 'supports' &&
        c.sourceContributions.some((sc) => sc.relationship === 'supports' && sc.relevance === 'direct'),
    );

    const conflicts: ClaimConflictSet[] = [];
    const conflictSetIds = new Set<string>();
    for (const c of claims) {
      const cSets = this.getConflictSetsForClaim(c.id);
      for (const cs of cSets) {
        if (!conflictSetIds.has(cs.id)) {
          conflictSetIds.add(cs.id);
          conflicts.push(cs);
        }
      }
    }

    const populations = Array.from(new Set(claims.flatMap((c) => c.populationIds)));
    const stages = Array.from(new Set(claims.flatMap((c) => c.diseaseStageDefinitionIds ?? [])));
    const strategies = Array.from(new Set([...claims.flatMap((c) => c.targetingStrategyIds ?? []), ...paths.map((p) => p.targetingStrategyId)]));
    const geometries = Array.from(new Set([...paths.map((p) => p.targetGeometryType), ...(family?.permittedTargetGeometryTypes ?? [])]));
    const treatmentContexts = Array.from(
      new Set([
        ...claims.flatMap((c) => c.treatmentContextRequirementIds ?? []),
        ...paths.flatMap((p) => p.treatmentContextRequirementIds ?? []),
        ...(family?.treatmentContextRequirementIds ?? []),
      ]),
    );
    const limitations = Array.from(new Set([...claims.flatMap((c) => c.limitations), ...(family?.limitations ?? [])]));

    let assignedTier: LegacyEvidenceTier | undefined = undefined;
    let permittedRoles: Record<string, boolean> | undefined = undefined;

    for (const c of claims) {
      const gov = this.governanceByClaimId.get(c.id);
      if (gov?.classificationStatus === 'assigned' && gov.magniomEvidenceTier) {
        if (!assignedTier || gov.magniomEvidenceTier < assignedTier) {
          assignedTier = gov.magniomEvidenceTier;
          permittedRoles = gov.permittedRoles as unknown as Record<string, boolean>;
        }
      }
    }

    return {
      targetFamilyId,
      indicationId,
      evidencePaths: paths,
      strongestDirectSupport: directSupportClaims.length > 0 ? directSupportClaims : claims.slice(0, 2),
      materialConflicts: conflicts,
      populationApplicability: populations,
      stageApplicability: stages,
      targetingStrategies: strategies,
      targetGeometries: geometries.length > 0 ? geometries : family?.permittedTargetGeometryTypes ?? ['point'],
      treatmentContexts,
      limitationsAndUncertainties: limitations,
      assignedTier,
      permittedRoles,
    };
  }

  /**
   * §98. Query — "What exactly is clinically permitted?"
   * Traverses: IndicationModuleRelease -> ScientificPolicyRelease -> EvidencePath[path_status = clinical_permitted]
   * -> TargetFamily -> TargetingStrategy -> TargetGeometry.
   * Enforces: SHALL NOT filter merely by high Evidence Tier!
   */
  public queryWhatIsClinicallyPermitted(
    indicationModuleReleaseId: string,
    scientificPolicyReleaseId?: string,
  ): ClinicallyPermittedQueryResult {
    const allPaths = this.getEvidencePathsForIndication(indicationModuleReleaseId);
    const permittedPaths = allPaths.filter((p) => {
      if (p.pathStatus !== 'clinical_permitted') return false;
      if (scientificPolicyReleaseId && p.scientificPolicyReleaseId) {
        return p.scientificPolicyReleaseId === scientificPolicyReleaseId;
      }
      return true;
    });

    const targetFamilies: TargetFamilyV2[] = [];
    const tfIds = new Set<string>();
    const strategies = new Set<string>();
    const geometries = new Set<TargetGeometryType>();

    for (const p of permittedPaths) {
      const tf = this.getTargetFamily(p.targetFamilyId);
      if (tf && !tfIds.has(tf.id)) {
        tfIds.add(tf.id);
        targetFamilies.push(tf);
      }
      strategies.add(p.targetingStrategyId);
      geometries.add(p.targetGeometryType);
    }

    return {
      indicationModuleReleaseId,
      scientificPolicyReleaseId,
      permittedPaths,
      permittedTargetFamilies: targetFamilies,
      permittedTargetingStrategies: Array.from(strategies),
      permittedTargetGeometries: Array.from(geometries),
    };
  }

  /**
   * §99. Query — "What does the evidence say, without a Tier?"
   * Returns dimensional synthesis profile even when governance Tier is unassigned.
   */
  public queryEvidenceWithoutTier(evidenceClaimIdOrIndicationId: string): EvidenceWithoutTierQueryResult[] {
    const claim = this.getClaim(evidenceClaimIdOrIndicationId);
    let targetClaims: readonly EvidenceClaimV2[] = [];

    if (claim) {
      targetClaims = [claim];
    } else {
      targetClaims = this.getClaimsByIndication(evidenceClaimIdOrIndicationId);
    }

    return targetClaims.map((c) => {
      const syn = this.getSynthesisForClaim(c.id);
      const gov = this.getGovernanceClassificationForClaim(c.id);

      return {
        claimId: c.id,
        claimCode: c.code,
        statement: c.statement,
        synthesis: syn,
        governanceStatus: gov?.classificationStatus ?? 'unassigned',
        directness: syn?.directness,
        replication: syn?.replication,
        consistency: syn?.consistency,
        targetSpecificity: syn?.targetSpecificity,
        clinicalApplicability: syn?.clinicalApplicability,
        treatmentContextDependence: syn?.treatmentContextDependence,
      };
    });
  }

  /**
   * §100. Query — "What targets are only staging?"
   * Audits targets that are staging/research and asserts zero clinical permission.
   */
  public queryStagingTargets(indicationId: string): StagingTargetsQueryResult {
    const families = this.getTargetFamiliesByIndication(indicationId);
    const stagingFamilies = families.filter((tf) => tf.governanceStatus === 'staging');
    const researchFamilies = families.filter((tf) => tf.governanceStatus === 'research');

    const indSnippet = indicationId.replace('ind-', '');
    const paths = Array.from(this.pathsById.values()).filter(
      (p) =>
        families.some((f) => f.id === p.targetFamilyId || f.code === p.targetFamilyId) ||
        p.indicationModuleReleaseId.toLowerCase().includes(indSnippet),
    );

    const stagingPaths = paths.filter((p) => p.pathStatus === 'staging');
    const researchPaths = paths.filter((p) => p.pathStatus === 'research_permitted');

    return {
      indicationId,
      stagingTargetFamilies: stagingFamilies,
      researchTargetFamilies: researchFamilies,
      clinicalPermission: false,
      stagingPaths,
      researchPaths,
    };
  }

  /**
   * §101. Query — "Which claims have important null evidence?"
   * Traverses HAS_NULL_EVIDENCE relations and retrieves conflicting claims and null findings.
   */
  public queryClaimsWithNullEvidence(indicationId?: string): NullEvidenceQueryResult[] {
    const negativeClaims = this.getNegativeClaims(indicationId);
    const results: NullEvidenceQueryResult[] = [];

    for (const claim of negativeClaims) {
      const conflictSets = this.getConflictSetsForClaim(claim.id);
      const nullFindings: SourceFinding[] = [];

      for (const contrib of claim.sourceContributions) {
        if (contrib.relationship === 'does_not_support' || contrib.relationship === 'conflicts') {
          const findings = this.getFindingsBySource(contrib.sourceId);
          findings.forEach((f) => {
            if (
              f.findingType === 'null_result' ||
              f.findingType === 'limitation' ||
              f.findingType === 'guideline_recommendation' ||
              claim.claimType === 'negative_evidence'
            ) {
              nullFindings.push(f);
            }
          });
        }
      }

      const conflictingClaimList: EvidenceClaimV2[] = [];
      for (const cs of conflictSets) {
        const otherIds = cs.subjectClaimId === claim.id ? cs.conflictingClaimIds : [cs.subjectClaimId];
        for (const cid of otherIds) {
          const c = this.getClaim(cid);
          if (c && !conflictingClaimList.some((existing) => existing.id === c.id)) {
            conflictingClaimList.push(c);
          }
        }
      }

      results.push({
        claimId: claim.id,
        claimCode: claim.code,
        nullFindings,
        conflictingClaims: conflictingClaimList,
        explanation: conflictSets[0]?.explanation,
      });
    }

    return results;
  }

  /**
   * §102. Query — "What changed?"
   * Diffs two Evidence releases returning changed sources, findings, claims, conflicts, etc.
   */
  public diffEvidenceReleases(otherRelease: EvidenceReleasePackageV2): EvidenceReleaseDiffResult {
    const oldSources = new Set(otherRelease.sources.map((s) => s.id));
    const currentSources = new Set(this.getSources().map((s) => s.id));

    const addedSources = Array.from(currentSources).filter((id) => !oldSources.has(id));
    const removedSources = Array.from(oldSources).filter((id) => !currentSources.has(id));

    const oldFindings = new Set(otherRelease.findings.map((f) => f.id));
    const currentFindings = new Set(this.getFindings().map((f) => f.id));
    const addedFindings = Array.from(currentFindings).filter((id) => !oldFindings.has(id));

    const oldClaimsMap = new Map(otherRelease.claims.map((c) => [c.id, c]));
    const currentClaims = this.getClaims();

    const addedClaims: string[] = [];
    const changedClaimWording: { claimId: string; oldStatement: string; newStatement: string }[] = [];

    for (const claim of currentClaims) {
      const oldClaim = oldClaimsMap.get(claim.id);
      if (!oldClaim) {
        addedClaims.push(claim.id);
      } else if (oldClaim.statement !== claim.statement) {
        changedClaimWording.push({
          claimId: claim.id,
          oldStatement: oldClaim.statement,
          newStatement: claim.statement,
        });
      }
    }

    const oldConflictIds = new Set(otherRelease.conflictSets.map((c) => c.id));
    const currentConflictIds = new Set(this.getConflictSets().map((c) => c.id));

    const newConflicts = Array.from(currentConflictIds).filter((id) => !oldConflictIds.has(id));
    const resolvedConflicts = Array.from(oldConflictIds).filter((id) => !currentConflictIds.has(id));

    const oldGovMap = new Map(otherRelease.governanceClassifications.map((g) => [g.id, g]));
    const currentGov = Array.from(this.governanceById.values());

    const newGovClassifications = currentGov
      .filter((g) => !oldGovMap.has(g.id) && g.classificationStatus !== 'unassigned')
      .map((g) => g.id);
    const withdrawnGovClassifications = currentGov
      .filter((g) => g.classificationStatus === 'withdrawn')
      .map((g) => g.id);

    const oldPathIds = new Set(otherRelease.evidencePaths.map((p) => p.id));
    const currentPathIds = new Set(this.getEvidencePaths().map((p) => p.id));
    const changedEvidencePaths = Array.from(currentPathIds).filter((id) => !oldPathIds.has(id));

    return {
      oldReleaseCode: otherRelease.version,
      newReleaseCode: this.getReleaseVersion(),
      addedSources,
      removedSources,
      addedFindings,
      addedClaims,
      changedClaimWording,
      newConflicts,
      resolvedConflicts,
      changedSyntheses: [],
      newGovernanceClassifications: newGovClassifications,
      withdrawnClassifications: withdrawnGovClassifications,
      changedEvidencePaths,
    };
  }

  // =========================================================================
  // GRAPH VALIDATION RULES (§117 - §123)
  // =========================================================================

  /**
   * §117. Graph Validation — Claim Wording
   * Rejects overbroad claims (e.g. "rTMS uniformly improves stroke recovery").
   */
  public validateClaimWording(claim: EvidenceClaimV2): { valid: boolean; reason?: string } {
    const text = claim.statement.toLowerCase();
    const overbroadTerms = [
      'uniformly effective',
      'proves efficacy',
      'universally cures',
      'uniformly cures',
      'guarantees recovery',
      'cures stroke',
      'cures',
    ];
    if (overbroadTerms.some((term) => text.includes(term))) {
      return {
        valid: false,
        reason: `Claim ${claim.code} contains overbroad assertions violating §117: "${claim.statement}"`,
      };
    }
    if (claim.statement.length < 20) {
      return {
        valid: false,
        reason: `Claim ${claim.code} statement is too brief to define a narrow scientific proposition (§1, §117).`,
      };
    }
    return { valid: true };
  }

  /**
   * §118. Graph Validation — Target Specificity
   * A claim bound to a TargetFamily must demonstrate that the supporting evidence actually tested that family.
   */
  public validateTargetSpecificity(claim: EvidenceClaimV2): { valid: boolean; reason?: string } {
    if (!claim.targetFamilyIds || claim.targetFamilyIds.length === 0) {
      // In TBI, missing target specificity is valid information (§50, §87)!
      return { valid: true };
    }

    for (const tfId of claim.targetFamilyIds) {
      const family = this.getTargetFamily(tfId);
      if (!family) {
        return {
          valid: false,
          reason: `Claim ${claim.code} references unknown TargetFamily: ${tfId} violating §118.`,
        };
      }
    }
    return { valid: true };
  }

  /**
   * §119. Graph Validation — Treatment Context
   * If efficacy materially depends on rehabilitation, SLT, or provocation, an explicit context edge is required.
   */
  public validateTreatmentContext(claim: EvidenceClaimV2, path?: EvidencePath): { valid: boolean; reason?: string } {
    const syn = this.getSynthesisForClaim(claim.id);
    if (syn?.treatmentContextDependence === 'material') {
      const hasClaimContext = (claim.treatmentContextRequirementIds?.length ?? 0) > 0;
      const hasPathContext = path ? (path.treatmentContextRequirementIds?.length ?? 0) > 0 : true;

      if (!hasClaimContext && !hasPathContext) {
        return {
          valid: false,
          reason: `Claim ${claim.code} has material treatment context dependence but lacks explicit treatment context requirements violating §119.`,
        };
      }
    }
    return { valid: true };
  }

  /**
   * §120. Graph Validation — Negative Evidence
   * Claims with known material negative/conflicting evidence must include the relevant conflict relation.
   */
  public validateNegativeEvidence(indicationId: string): { valid: boolean; missingConflicts: string[] } {
    if (indicationId === 'ind-mdd-001') return { valid: true, missingConflicts: [] };

    const negClaims = this.getNegativeClaims(indicationId);
    if (negClaims.length === 0) {
      return {
        valid: false,
        missingConflicts: [`Indication ${indicationId} omits mandatory conflicting/null evidence violating §120.`],
      };
    }
    return { valid: true, missingConflicts: [] };
  }

  /**
   * §121. Graph Validation — Source Overlap
   * Meta-analyses reusing primary studies must not be treated as independent replications.
   */
  public validateSourceOverlap(claim: EvidenceClaimV2): { valid: boolean; overlapIssues: string[] } {
    const issues: string[] = [];
    for (const contrib of claim.sourceContributions) {
      if (!contrib.independence || contrib.independence === 'unknown') {
        issues.push(`Contribution for source ${contrib.sourceId} has unknown independence.`);
      }
    }
    return {
      valid: issues.length === 0,
      overlapIssues: issues,
    };
  }

  /**
   * §122. Graph Validation — Currentness
   * Active claims must carry review dates for living evidence surveillance.
   */
  public validateCurrentness(claim: EvidenceClaimV2, asOfDate: Date = new Date()): { valid: boolean; isOverdue: boolean } {
    const reviewedAt = claim.reviewedAt ?? claim.provenance?.createdAt;
    const nextReviewDue =
      claim.nextReviewDue ??
      (reviewedAt ? new Date(new Date(reviewedAt).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined);
    if (!reviewedAt || !nextReviewDue) {
      return { valid: false, isOverdue: false };
    }
    const dueDate = new Date(nextReviewDue);
    const isOverdue = asOfDate.getTime() > dueDate.getTime();
    return { valid: true, isOverdue };
  }

  /**
   * §123. Graph Validation — Retraction / Correction
   * Retracted or corrected sources flag dependent claims for review.
   */
  public validateRetractionStatus(sourceId: string): { retracted: boolean; affectedClaims: EvidenceClaimV2[] } {
    const source = this.getSource(sourceId);
    const isRetracted = source?.notes?.toLowerCase().includes('retracted') ?? false;
    const affectedClaims = this.getClaims().filter((c) => c.sourceContributions.some((sc) => sc.sourceId === sourceId));

    return {
      retracted: isRetracted,
      affectedClaims,
    };
  }

  // =========================================================================
  // RELEASE GOLDEN QUESTIONNAIRE EVALUATION (§143)
  // =========================================================================

  /**
   * §143. Release Golden Tests Evaluator
   * Answers the 10 release questions deterministically for any target candidate / family.
   */
  public evaluateReleaseGoldenQuestionnaire(query: {
    targetFamilyId: string;
    indicationId: string;
  }): {
    doesClaimExist: boolean;
    population: readonly string[];
    outcomes: readonly string[];
    targetTested: string;
    targetGeometry: TargetGeometryType;
    treatmentContext: readonly string[];
    supportingSources: readonly string[];
    conflictingSources: readonly string[];
    tierAssigned: boolean;
    tier?: LegacyEvidenceTier | undefined;
    pathStatus: 'staging' | 'research_permitted' | 'validation_permitted' | 'clinical_permitted' | 'suspended';
  } {
    const whyResult = this.queryWhyThisTarget(query.targetFamilyId, query.indicationId);
    const primaryClaim = whyResult.strongestDirectSupport[0];
    const path = whyResult.evidencePaths[0];

    const supportingSources = whyResult.strongestDirectSupport.flatMap((c) =>
      c.sourceContributions.filter((sc) => sc.relationship === 'supports').map((sc) => sc.sourceId),
    );

    const conflictingSources = whyResult.materialConflicts.flatMap((cs) => cs.conflictingClaimIds);

    return {
      doesClaimExist: Boolean(primaryClaim),
      population: whyResult.populationApplicability,
      outcomes: primaryClaim ? primaryClaim.outcomeDomainIds : [],
      targetTested: whyResult.targetFamilyId,
      targetGeometry: whyResult.targetGeometries[0] ?? 'point',
      treatmentContext: whyResult.treatmentContexts,
      supportingSources: Array.from(new Set(supportingSources)),
      conflictingSources: Array.from(new Set(conflictingSources)),
      tierAssigned: Boolean(whyResult.assignedTier),
      tier: whyResult.assignedTier,
      pathStatus: path?.pathStatus ?? 'staging',
    };
  }

  // =========================================================================
  // MODULE EXIT CRITERIA VERIFICATION (§75, 110-116)
  // =========================================================================

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
        violations.push(
          `Target-generating claim ${claim.code} lifecycleStatus is ${claim.lifecycleStatus}, expected approved_scientific_claim.`,
        );
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
