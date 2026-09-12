/**
 * @magniom/evidence - Network Evidence Claims & Provenance
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§21-25)
 */

import type { NetworkEvidenceClaim, NetworkEvidenceLevel } from '@magniom/domain';

export const MDD_INDICATION_ID = '00000000-0000-4000-8000-000000000001';

export const CANONICAL_NETWORK_EVIDENCE_CLAIMS: readonly NetworkEvidenceClaim[] = [
  // Level A — Network Association (§23)
  {
    id: 'e0000000-0000-4000-8000-000000000001',
    evidence_claim_id: 'CLAIM-NET-MDD-TOPO-01',
    network_system_ids: [
      'c0000000-0000-4000-8000-000000000001',
      'd0000000-0000-4000-8000-000000000002',
      's0000000-0000-4000-8000-000000000003',
    ],
    relationship_ids: ['r0000000-0000-4000-8000-000000000001'],
    indication_id: MDD_INDICATION_ID,
    claim_type: 'association',
    evidence_level: 'A',
    population_scope: 'Adult unipolar major depressive disorder',
    methodology: 'Resting-state fMRI meta-analysis across multi-site clinical cohorts',
    directionality: 'Altered CEN-DMN segregation and decreased within-CEN coherence in MDD',
    applicability: 'direct',
    provenance_refs: ['Menon_2011_Triple_Network', 'Kaiser_2015_JAMA_Psychiatry'],
    approved_for: 'clinical_context',
  },

  // Level B — Network-Phenotype Relationship (§23)
  {
    id: 'e0000000-0000-4000-8000-000000000002',
    evidence_claim_id: 'CLAIM-NET-MDD-PHENOTYPE-01',
    network_system_ids: [
      'c0000000-0000-4000-8000-000000000001',
      'd0000000-0000-4000-8000-000000000002',
    ],
    relationship_ids: ['r0000000-0000-4000-8000-000000000001'],
    indication_id: MDD_INDICATION_ID,
    claim_type: 'phenotype_relationship',
    evidence_level: 'B',
    population_scope: 'Treatment-resistant depression with dysphoric rumination',
    methodology: 'Replicated cohort functional connectivity and symptom mapping',
    directionality: 'High rumination severity correlates with reduced CEN-DMN anti-correlation',
    applicability: 'direct',
    provenance_refs: ['Drysdale_2017_NatMed_Biotypes', 'Hamilton_2015_BiolPsychiatry'],
    approved_for: 'clinical_context',
  },

  // Level C — Network-Therapeutic Circuit Relationship (§23, 30, 31)
  {
    id: 'e0000000-0000-4000-8000-000000000003',
    evidence_claim_id: 'CLAIM-NET-MDD-CIRCUIT-01',
    network_system_ids: [
      'c0000000-0000-4000-8000-000000000001',
      'd0000000-0000-4000-8000-000000000002',
    ],
    relationship_ids: ['r0000000-0000-4000-8000-000000000001'],
    indication_id: MDD_INDICATION_ID,
    claim_type: 'circuit_relationship',
    evidence_level: 'B',
    population_scope: 'Adult TRD undergoing left DLPFC rTMS',
    methodology: 'Prospective pre/post connectomics and therapeutic circuit engagement',
    directionality: 'sgACC-DLPFC anti-correlated circuit intersects left DLPFC BA46 nodes of CEN',
    applicability: 'direct',
    provenance_refs: ['Fox_2012_PNAS_sgACC', 'Siddiqi_2021_AmJPsychiatry'],
    approved_for: 'clinical_context',
  },

  // Level D — Network-Guided Targeting Evidence (§23, 34)
  {
    id: 'e0000000-0000-4000-8000-000000000004',
    evidence_claim_id: 'CLAIM-NET-MDD-TARGETING-01',
    network_system_ids: ['c0000000-0000-4000-8000-000000000001'],
    indication_id: MDD_INDICATION_ID,
    claim_type: 'target_relationship',
    evidence_level: 'C',
    population_scope: 'Adult TRD',
    methodology: 'Retrospective individual FC target refinement within BA46',
    directionality: 'Network context qualifies interpretation but cannot independently displace evidence anchor',
    applicability: 'partial',
    provenance_refs: ['Cash_2021_BiolPsychiatry'],
    approved_for: 'clinical_refinement',
  },
];

/**
 * Enforces evidence ceiling principle (§24):
 * Network observation cannot exceed underlying evidence level.
 * Level A cannot justify a Level D clinical target.
 */
export function enforceEvidenceCeiling(
  measuredLevel: NetworkEvidenceLevel,
  claimLevel: NetworkEvidenceLevel,
): NetworkEvidenceLevel {
  const rank: Record<NetworkEvidenceLevel, number> = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    R: 0,
  };

  const effectiveRank = Math.min(rank[measuredLevel] ?? 0, rank[claimLevel] ?? 0);
  const entries = Object.entries(rank) as [NetworkEvidenceLevel, number][];
  const matched = entries.find(([, val]) => val === effectiveRank);
  return matched ? matched[0] : 'R';
}
