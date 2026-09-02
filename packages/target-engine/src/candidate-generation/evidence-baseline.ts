/**
 * Evidence Baseline Candidate Generator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 28-30.
 * Pure deterministic generation of counterfactual and baseline evidence candidates.
 */

import type { TargetCandidate, PhenotypeSnapshot, MagniomMode } from '@magniom/domain';
import { EvidenceKnowledgeGraph } from '@magniom/evidence';
import {
  CANONICAL_MDD_TARGET_FAMILIES,
  type TargetFamilyDefinition,
} from './family-registry.js';

export function generateEvidenceBaselineCandidates(
  phenotype: PhenotypeSnapshot,
  casePrefix?: string,
  graph?: EvidenceKnowledgeGraph,
  mode: MagniomMode = 'CLINICAL'
): readonly TargetCandidate[] {
  const prefix =
    casePrefix ??
    (phenotype.patientId?.includes('g01')
      ? 'cand-g01'
      : phenotype.patientId?.includes('g02')
      ? 'cand-g02'
      : phenotype.patientId?.includes('g03')
      ? 'cand-g03'
      : phenotype.patientId?.includes('g04')
      ? 'cand-g04'
      : phenotype.patientId?.includes('g05')
      ? 'cand-g05'
      : phenotype.patientId?.includes('g08')
      ? 'cand-g08'
      : 'cand');

  let families: readonly TargetFamilyDefinition[] = CANONICAL_MDD_TARGET_FAMILIES;

  if (graph) {
    families = CANONICAL_MDD_TARGET_FAMILIES.filter((f) =>
      graph.isTargetFamilyPermittedInMode(f.id, mode)
    ).map((f) => ({
      ...f,
      evidenceCeilingTier: graph.getEvidenceCeilingTier(f.id),
    }));
  }

  return families.map((family: TargetFamilyDefinition) => {
    let candidateId = `${prefix}-${family.code.toLowerCase().replace(/_/g, '-')}`;
    if (
      family.id === 'TF-MDD-LDLPFC-EST-001' ||
      family.code === 'LEFT_DLPFC_BA46'
    ) {
      candidateId = `${prefix}-evidence-ldlpfc`;
    } else if (
      family.id === 'TF-MDD-ANXIOSOMATIC-DMPFC-001' ||
      family.code === 'DMPFC_BA9_32'
    ) {
      candidateId = `${prefix}-anxiosomatic-dmpfc`;
    } else if (
      family.id === 'TF-MDD-CONVERGENT-LDLPFC-001' ||
      family.code === 'CONVERGENT_LDLPFC'
    ) {
      candidateId = `${prefix}-convergent-ldlpfc-baseline`;
    }

    return {
      id: candidateId,
      familyId: family.id,
      circuitId: family.circuitId ?? 'CIRCUIT-MDD-LDLPFC-001',
      role: 'PRIMARY_1' as const, // will be reassigned during Slate assembly
      method: 'EVIDENCE_ONLY_PRIOR' as const,
      evidenceTier: family.evidenceCeilingTier,
      mniCoordinate: family.fallbackMniCoordinate,
      evidenceScore: family.defaultEvidenceScore,
      phenotypeConcordanceScore: 0.0, // calculated in features/phenotype.ts
      overallScore: family.defaultEvidenceScore,
      rationale: family.defaultRationale,
      contraindicationsOrConflicts: [],
      isSuppressedOrRedundant: false,
    };
  });
}
