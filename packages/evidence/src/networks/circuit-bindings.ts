/**
 * @magniom/evidence - Therapeutic Circuit Network Context Bindings
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§30-31)
 */

import type { TherapeuticCircuitNetworkContext } from '@magniom/domain';

export const CANONICAL_CIRCUIT_NETWORK_CONTEXTS: readonly TherapeuticCircuitNetworkContext[] = [
  // sgACC-DLPFC Convergent Circuit (TC-MDD-CONVERGENT-001)
  {
    therapeutic_circuit_id: '11111111-0001-4000-8000-000000000001',
    network_system_id: 'c0000000-0000-4000-8000-000000000001',
    network_code: 'CEN',
    relationship_type: 'intersects',
    evidence_claim_ids: ['e0000000-0000-4000-8000-000000000003'],
    evidence_level: 'B',
    clinical_authority: 'clinical',
  },
  {
    therapeutic_circuit_id: '11111111-0001-4000-8000-000000000001',
    network_system_id: 'd0000000-0000-4000-8000-000000000002',
    network_code: 'DMN',
    relationship_type: 'modulates',
    evidence_claim_ids: ['e0000000-0000-4000-8000-000000000003'],
    evidence_level: 'B',
    clinical_authority: 'contextual',
  },
  // Anxiosomatic DMPFC Circuit (TC-MDD-ANXIOSOMATIC-001)
  {
    therapeutic_circuit_id: '11111111-0002-4000-8000-000000000002',
    network_system_id: 's0000000-0000-4000-8000-000000000003',
    network_code: 'SN',
    relationship_type: 'intersects',
    evidence_claim_ids: ['e0000000-0000-4000-8000-000000000002'],
    evidence_level: 'B',
    clinical_authority: 'clinical',
  },
];
