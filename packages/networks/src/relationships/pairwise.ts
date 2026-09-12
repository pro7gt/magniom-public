/**
 * @magniom/networks - Canonical Pairwise Network Relationships
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§12, 14)
 */

import type { NetworkRelationship } from '@magniom/domain';
import { CANONICAL_CEN_SYSTEM_ID } from '../definitions/cen.js';
import { CANONICAL_DMN_SYSTEM_ID } from '../definitions/dmn.js';
import { CANONICAL_SN_SYSTEM_ID } from '../definitions/sn.js';

export const CANONICAL_RELATIONSHIP_CEN_DMN_ID = 'r0000000-0000-4000-8000-000000000001';
export const CANONICAL_RELATIONSHIP_SN_CEN_ID = 'r0000000-0000-4000-8000-000000000002';
export const CANONICAL_RELATIONSHIP_SN_DMN_ID = 'r0000000-0000-4000-8000-000000000003';

export const CANONICAL_RELATIONSHIP_CEN_DMN: NetworkRelationship = {
  id: CANONICAL_RELATIONSHIP_CEN_DMN_ID,
  network_a_id: CANONICAL_CEN_SYSTEM_ID,
  network_b_id: CANONICAL_DMN_SYSTEM_ID,
  relationship_code: 'CEN_DMN',
  metric_code: 'fisher_z_mean_cross_fc',
  metric_version: '1.0.0',
  directionality: 'undirected',
  evidence_claim_ids: ['e0000000-0000-4000-8000-000000000010'],
  status: 'validated',
};

export const CANONICAL_RELATIONSHIP_SN_CEN: NetworkRelationship = {
  id: CANONICAL_RELATIONSHIP_SN_CEN_ID,
  network_a_id: CANONICAL_SN_SYSTEM_ID,
  network_b_id: CANONICAL_CEN_SYSTEM_ID,
  relationship_code: 'SN_CEN',
  metric_code: 'fisher_z_mean_cross_fc',
  metric_version: '1.0.0',
  directionality: 'undirected',
  evidence_claim_ids: ['e0000000-0000-4000-8000-000000000011'],
  status: 'validated',
};

export const CANONICAL_RELATIONSHIP_SN_DMN: NetworkRelationship = {
  id: CANONICAL_RELATIONSHIP_SN_DMN_ID,
  network_a_id: CANONICAL_SN_SYSTEM_ID,
  network_b_id: CANONICAL_DMN_SYSTEM_ID,
  relationship_code: 'SN_DMN',
  metric_code: 'fisher_z_mean_cross_fc',
  metric_version: '1.0.0',
  directionality: 'undirected',
  evidence_claim_ids: ['e0000000-0000-4000-8000-000000000012'],
  status: 'validated',
};

export const CANONICAL_PAIRWISE_RELATIONSHIPS = [
  CANONICAL_RELATIONSHIP_CEN_DMN,
  CANONICAL_RELATIONSHIP_SN_CEN,
  CANONICAL_RELATIONSHIP_SN_DMN,
] as const;

/**
 * Normative reference values derived from healthy cohort resting-state fMRI
 * Fisher-z transformed correlation distributions (Glasser HCP-MMP1.0)
 */
export const NORMATIVE_REFERENCE_DISTRIBUTIONS = {
  CEN_DMN: {
    mean_z: -0.22,
    std_z: 0.08,
    typical_segregation_index: 0.65,
  },
  SN_CEN: {
    mean_z: 0.18,
    std_z: 0.07,
    typical_segregation_index: 0.35,
  },
  SN_DMN: {
    mean_z: -0.05,
    std_z: 0.09,
    typical_segregation_index: 0.45,
  },
  WITHIN_CEN: {
    mean_z: 0.45,
    std_z: 0.06,
  },
  WITHIN_DMN: {
    mean_z: 0.52,
    std_z: 0.07,
  },
  WITHIN_SN: {
    mean_z: 0.42,
    std_z: 0.08,
  },
} as const;
