/**
 * Evidence Knowledge Graph Traversal & Evidence Ceiling Engine
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0.
 */

import type {
  EvidenceLibraryRelease,
  TargetFamily,
  TherapeuticCircuit,
  EvidenceClaim,
  EvidenceTier,
  LegacyEvidencePath as EvidencePath,
  EvidenceConflictRef,
  SearchSpace,
  TargetDefinition,
  MagniomMode,
} from '@magniom/domain';
import { CANONICAL_EVIDENCE_RELEASE_1_0_0 } from './canonical-manifest.js';

export const EVIDENCE_TIER_ORDER: Record<EvidenceTier, number> = {
  T1: 1,
  T2: 2,
  T3: 3,
  T4: 4,
  T_EXP: 5,
};

export class EvidenceKnowledgeGraph {
  private readonly release: EvidenceLibraryRelease;
  private readonly familiesById = new Map<string, TargetFamily>();
  private readonly familiesByCode = new Map<string, TargetFamily>();
  private readonly circuitsById = new Map<string, TherapeuticCircuit>();
  private readonly circuitsByCode = new Map<string, TherapeuticCircuit>();
  private readonly claimsById = new Map<string, EvidenceClaim>();
  private readonly claimsByCode = new Map<string, EvidenceClaim>();
  private readonly searchSpacesByFamily = new Map<string, SearchSpace>();
  private readonly targetDefinitionsByFamily = new Map<string, TargetDefinition[]>();

  constructor(release?: EvidenceLibraryRelease) {
    this.release = release ?? CANONICAL_EVIDENCE_RELEASE_1_0_0;
    this.buildIndexes();
  }

  private buildIndexes(): void {
    for (const claim of this.release.claims) {
      this.claimsById.set(claim.id, claim);
      if (claim.code) {
        this.claimsByCode.set(claim.code, claim);
      }
    }

    for (const circuit of this.release.circuits) {
      this.circuitsById.set(circuit.id, circuit);
      this.circuitsByCode.set(circuit.code, circuit);
    }

    for (const family of this.release.families) {
      this.familiesById.set(family.id, family);
      this.familiesByCode.set(family.code, family);
    }

    if (this.release.searchSpaces) {
      for (const ss of this.release.searchSpaces) {
        this.searchSpacesByFamily.set(ss.targetFamilyId, ss);
      }
    }

    if (this.release.targetDefinitions) {
      for (const td of this.release.targetDefinitions) {
        const existing = this.targetDefinitionsByFamily.get(td.targetFamilyId) ?? [];
        existing.push(td);
        this.targetDefinitionsByFamily.set(td.targetFamilyId, existing);
      }
    }
  }

  public getReleaseVersion(): string {
    return this.release.version;
  }

  public getTargetFamilies(): readonly TargetFamily[] {
    return this.release.families;
  }

  public getTargetFamily(idOrCode: string): TargetFamily | undefined {
    return this.familiesById.get(idOrCode) ?? this.familiesByCode.get(idOrCode);
  }

  public getCircuit(idOrCode: string): TherapeuticCircuit | undefined {
    return this.circuitsById.get(idOrCode) ?? this.circuitsByCode.get(idOrCode);
  }

  public getClaim(idOrCode: string): EvidenceClaim | undefined {
    return this.claimsById.get(idOrCode) ?? this.claimsByCode.get(idOrCode);
  }

  /**
   * Resolves the Evidence Ceiling Tier for a given TargetFamily.
   * Traverses the graph to verify that connected therapeutic circuits and claims support this ceiling.
   */
  public getEvidenceCeilingTier(familyIdOrCode: string): EvidenceTier {
    const family = this.getTargetFamily(familyIdOrCode);
    if (!family) {
      return 'T_EXP';
    }

    let highestTier = family.evidenceCeilingTier;

    // Check connected circuits if available
    const connectedCodes = family.connectedCircuitCodes ?? (family.circuitId ? [family.circuitId] : []);
    for (const cCode of connectedCodes) {
      const circuit = this.getCircuit(cCode);
      if (circuit?.tier) {
        if (EVIDENCE_TIER_ORDER[circuit.tier] > EVIDENCE_TIER_ORDER[highestTier]) {
          highestTier = circuit.tier;
        }
      }
    }

    return highestTier;
  }

  /**
   * Determines if a target family is permitted in the specified execution mode.
   * In Clinical Mode, research targets (Tier 4 / T_EXP or mode='RESEARCH') are strictly prohibited.
   */
  public isTargetFamilyPermittedInMode(familyIdOrCode: string, mode: MagniomMode): boolean {
    const family = this.getTargetFamily(familyIdOrCode);
    if (!family) {
      return false;
    }

    if (mode === 'CLINICAL') {
      if (family.mode === 'RESEARCH' || family.mode === 'VALIDATION') {
        return false;
      }
      const ceiling = this.getEvidenceCeilingTier(familyIdOrCode);
      return ceiling === 'T1' || ceiling === 'T2';
    }

    return true; // Research and validation modes allow research targets
  }

  /**
   * Traverses graph to construct explicit traceability chains:
   * TargetFamily -> TherapeuticCircuit -> EvidenceClaim -> Sources.
   */
  public findEvidencePaths(familyIdOrCode: string): readonly EvidencePath[] {
    const family = this.getTargetFamily(familyIdOrCode);
    if (!family) {
      return [];
    }

    const paths: EvidencePath[] = [];
    const connectedCircuitCodes = family.connectedCircuitCodes ?? (family.circuitId ? [family.circuitId] : []);

    for (const circuitCode of connectedCircuitCodes) {
      const circuit = this.getCircuit(circuitCode);
      if (!circuit) continue;

      const claimCodes = circuit.connectedClaimCodes ?? [];
      for (const claimCode of claimCodes) {
        const claim = this.getClaim(claimCode);
        if (!claim) continue;

        const primarySource = claim.sources?.[0];
        const citation = primarySource?.citation ?? 'Magniom Evidence Knowledge Graph v1.0';
        const doi = primarySource?.doi;

        paths.push({
          pathId: `path-${family.code}-${circuit.code}-${claim.code ?? claim.id}`,
          targetFamilyCode: family.code,
          circuitCode: circuit.code,
          claimCode: claim.code ?? claim.id,
          claimStatement: claim.statement ?? claim.summary ?? '',
          claimTier: claim.tier,
          sourceCitation: citation,
          ...(doi ? { sourceDoi: doi } : {}),
          nodes: [
            { nodeType: 'condition', code: 'COND-MDD-001', label: 'Major Depressive Disorder' },
            {
              nodeType: 'circuit',
              code: circuit.code,
              label: circuit.name,
              ...(circuit.tier ? { tier: circuit.tier } : {}),
            },
            {
              nodeType: 'target_family',
              code: family.code,
              label: family.name,
              ...(family.evidenceCeilingTier ? { tier: family.evidenceCeilingTier } : {}),
            },
            {
              nodeType: 'claim',
              code: claim.code ?? claim.id,
              label: claim.statement ?? claim.summary ?? '',
              ...(claim.tier ? { tier: claim.tier } : {}),
            },
          ],
        });
      }
    }

    return paths;
  }

  /**
   * Retrieves relevant conflicting evidence and boundary claims (e.g. meta-analysis limitations).
   */
  public getConflictingClaims(familyIdOrCode?: string): readonly EvidenceConflictRef[] {
    const conflicts: EvidenceConflictRef[] = [];

    // Global governance negative evidence: Personalised targeting meta-analysis
    const negativeClaim = this.getClaim('EC-PERSONALISED-SUPERIORITY-001');
    if (negativeClaim) {
      const source = negativeClaim.sources?.[0];
      conflicts.push({
        claimCode: 'EC-PERSONALISED-SUPERIORITY-001',
        statement: negativeClaim.statement ?? 'No universal superiority of personalised targeting.',
        sourceCitation: source?.citation ?? 'Personalised TMS Meta-Analysis (2025)',
        ...(source?.doi ? { sourceDoi: source.doi } : {}),
        clinicalImplication:
          'Counterargument: fMRI personalised refinement does not guarantee superior outcome over fixed evidence baseline without verified high convergence and circuit concordance.',
      });
    }

    // Specific conflicting claims attached to connected circuits
    if (familyIdOrCode) {
      const family = this.getTargetFamily(familyIdOrCode);
      if (family) {
        const connectedCircuits = family.connectedCircuitCodes ?? (family.circuitId ? [family.circuitId] : []);
        for (const cCode of connectedCircuits) {
          const circuit = this.getCircuit(cCode);
          if (circuit) {
            for (const clmCode of circuit.connectedClaimCodes ?? []) {
              const claim = this.getClaim(clmCode);
              if (claim?.sources) {
                for (const s of claim.sources) {
                  if (s.relationship === 'conflicting') {
                    conflicts.push({
                      claimCode: claim.code ?? claim.id,
                      statement: claim.statement ?? '',
                      sourceCitation: s.citation,
                      ...(s.doi ? { sourceDoi: s.doi } : {}),
                      clinicalImplication: `Conflicting trial evidence reported in ${s.citation}.`,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    return conflicts;
  }

  public getSearchSpace(familyIdOrCode: string): SearchSpace | undefined {
    const family = this.getTargetFamily(familyIdOrCode);
    if (!family) return undefined;
    return this.searchSpacesByFamily.get(family.id) ?? this.searchSpacesByFamily.get(family.code);
  }

  public getTargetDefinition(familyIdOrCode: string): TargetDefinition | undefined {
    const family = this.getTargetFamily(familyIdOrCode);
    if (!family) return undefined;
    const defs = this.targetDefinitionsByFamily.get(family.id) ?? this.targetDefinitionsByFamily.get(family.code);
    return defs?.[0];
  }
}
