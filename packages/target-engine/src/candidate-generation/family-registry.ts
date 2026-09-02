/**
 * Target Family Registry & Evidence Library Definitions
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0.
 */

import type { TargetFamily, EvidenceTier } from '@magniom/domain';
import { EvidenceKnowledgeGraph } from '@magniom/evidence';

export interface TargetFamilyDefinition extends TargetFamily {
  readonly baselineCandidateId: string;
  readonly defaultEvidenceScore: number;
  readonly defaultRationale: string;
  readonly domainCoverage: Record<string, 'direct' | 'partial' | 'none'>;
}

export const CANONICAL_MDD_TARGET_FAMILIES: readonly TargetFamilyDefinition[] = [
  {
    id: 'TF-MDD-LDLPFC-EST-001',
    code: 'LEFT_DLPFC_BA46',
    name: 'Left Dorsolateral Prefrontal Cortex Established Evidence Anchor',
    hemisphere: 'L',
    primaryHcpParcel: 'p9-46v_L',
    fallbackMniCoordinate: {
      space: 'MNI152NLin2009cAsym',
      x: -38,
      y: 44,
      z: 30,
      unit: 'mm',
    },
    maxAllowableDisplacementMm: 15.0,
    evidenceCeilingTier: 'T1' as EvidenceTier,
    circuitId: 'CIRCUIT-MDD-LDLPFC-001',
    baselineCandidateId: 'cand-g01-evidence-ldlpfc',
    defaultEvidenceScore: 0.95,
    defaultRationale: 'Standard evidence-based left prefrontal depression anchor (no connectome available).',
    domainCoverage: {
      'DOMAIN-MDD-DYSPHORIC-001': 'direct',
      'DOMAIN-MDD-ANXIOSOMATIC-001': 'partial',
    },
  },
  {
    id: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
    code: 'DMPFC_BA9_32',
    name: 'Dorsomedial Prefrontal Anxiosomatic Circuit Target',
    hemisphere: 'L',
    primaryHcpParcel: '9m_L',
    fallbackMniCoordinate: {
      space: 'MNI152NLin2009cAsym',
      x: 0,
      y: 48,
      z: 46,
      unit: 'mm',
    },
    maxAllowableDisplacementMm: 15.0,
    evidenceCeilingTier: 'T2' as EvidenceTier,
    circuitId: 'CIRCUIT-MDD-ANXIOSOMATIC-001',
    baselineCandidateId: 'cand-g05-anxiosomatic-dmpfc',
    defaultEvidenceScore: 0.88,
    defaultRationale:
      'Distinct clinical hypothesis: Anxiosomatic DMPFC circuit target (BA9/32, MNI [0,48,46]) derived from 2026 randomized prospective circuit trial for prominent anxiety.',
    domainCoverage: {
      'DOMAIN-MDD-ANXIOSOMATIC-001': 'direct',
      'DOMAIN-MDD-DYSPHORIC-001': 'none',
    },
  },
  {
    id: 'TF-MDD-CONVERGENT-LDLPFC-001',
    code: 'CONVERGENT_LDLPFC',
    name: 'Convergent Left Prefrontal Depression Circuit Target',
    hemisphere: 'L',
    primaryHcpParcel: 'p9-46v_L',
    fallbackMniCoordinate: {
      space: 'MNI152NLin2009cAsym',
      x: -38,
      y: 44,
      z: 30,
      unit: 'mm',
    },
    maxAllowableDisplacementMm: 15.0,
    evidenceCeilingTier: 'T1' as EvidenceTier,
    circuitId: 'CIRCUIT-MDD-CONVERGENT-001',
    baselineCandidateId: 'cand-convergent-ldlpfc-baseline',
    defaultEvidenceScore: 0.95,
    defaultRationale: 'Convergent circuit left prefrontal depression anchor.',
    domainCoverage: {
      'DOMAIN-MDD-DYSPHORIC-001': 'direct',
      'DOMAIN-MDD-ANXIOSOMATIC-001': 'partial',
    },
  },
];

/**
 * Builds TargetFamilyDefinitions dynamically from an EvidenceKnowledgeGraph instance.
 */
export function getTargetFamilyDefinitionsFromGraph(
  graph: EvidenceKnowledgeGraph
): readonly TargetFamilyDefinition[] {
  const families = graph.getTargetFamilies();

  return families.map((family) => {
    const existing = CANONICAL_MDD_TARGET_FAMILIES.find(
      (f) => f.id === family.id || f.code === family.code
    );

    if (existing) {
      return {
        ...existing,
        ...family,
        evidenceCeilingTier: graph.getEvidenceCeilingTier(family.id),
      };
    }

    return {
      ...family,
      baselineCandidateId: `cand-${family.code.toLowerCase().replace(/_/g, '-')}-baseline`,
      defaultEvidenceScore: family.evidenceCeilingTier === 'T1' ? 0.95 : family.evidenceCeilingTier === 'T2' ? 0.88 : 0.60,
      defaultRationale: `${family.name} baseline candidate.`,
      domainCoverage: {},
      evidenceCeilingTier: graph.getEvidenceCeilingTier(family.id),
    };
  });
}
