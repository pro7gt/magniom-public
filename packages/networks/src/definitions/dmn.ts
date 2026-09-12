/**
 * @magniom/networks - Default Mode Network (DMN) Definition
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§7, 9, 11)
 * Parcellation: HCP-MMP1.0 (Glasser et al. 2016)
 */

import type { NetworkSystem, NetworkDefinition, NetworkNode } from '@magniom/domain';

export const CANONICAL_DMN_SYSTEM_ID = 'd0000000-0000-4000-8000-000000000002';
export const CANONICAL_DMN_DEFINITION_ID = 'd0000000-0000-4000-8000-000000000012';

export const CANONICAL_DMN_SYSTEM: NetworkSystem = {
  id: CANONICAL_DMN_SYSTEM_ID,
  code: 'DMN',
  name: 'Default Mode Network',
  description:
    'Distributed network supporting self-referential cognition, autobiographical memory, internally focused contemplation, and mentalizing.',
  definition_id: CANONICAL_DMN_DEFINITION_ID,
  version: '1.0.0',
  status: 'active',
};

export const CANONICAL_DMN_PARCEL_IDS: readonly string[] = [
  // Left Hemisphere
  'L_10v',
  'L_10r',
  'L_9m',
  'L_10d',
  'L_32d',
  'L_7m',
  'L_31pd',
  'L_31pv',
  'L_31a',
  'L_23d',
  'L_PGp',
  'L_PGs',
  'L_PFm',
  'L_TGd',
  'L_TE1a',
  // Right Hemisphere
  'R_10v',
  'R_10r',
  'R_9m',
  'R_10d',
  'R_32d',
  'R_7m',
  'R_31pd',
  'R_31pv',
  'R_31a',
  'R_23d',
  'R_PGp',
  'R_PGs',
  'R_PFm',
  'R_TGd',
  'R_TE1a',
];

export const CANONICAL_DMN_DEFINITION: NetworkDefinition = {
  id: CANONICAL_DMN_DEFINITION_ID,
  network_system_id: CANONICAL_DMN_SYSTEM_ID,
  version: '1.0.0',
  atlas_id: 'ATLAS-HCP-MMP1.0',
  atlas_version: '1.0',
  parcel_ids: CANONICAL_DMN_PARCEL_IDS,
  membership_method: 'Glasser_2016_DMN_MultiModal_Assignment',
  membership_parameters: {
    minimum_cortical_thickness_mm: 1.5,
    snr_threshold: 15.0,
    surface_space: 'fsLR_32k',
    parcels_count: 30,
  },
  source_evidence_claim_ids: [
    'e0000000-0000-4000-8000-000000000003',
    'e0000000-0000-4000-8000-000000000004',
  ],
  definition_hash: 'd4e282a394999460228b3394006f1ff882327e2f15fa8dc4f341cf1990d36102',
  effective_from: '2026-09-11T00:00:00.000Z',
  status: 'validated',
};

export const CANONICAL_DMN_NODES: readonly NetworkNode[] = [
  {
    id: 'node-dmn-l-7m',
    network_system_id: CANONICAL_DMN_SYSTEM_ID,
    parcel_id: 'L_7m',
    parcel_name: 'Medial Area 7 (Precuneus)',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -8, y: -56, z: 38 },
    functional_weight: 1.0,
  },
  {
    id: 'node-dmn-l-10v',
    network_system_id: CANONICAL_DMN_SYSTEM_ID,
    parcel_id: 'L_10v',
    parcel_name: 'Ventral Area 10 (mPFC)',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -4, y: 52, z: -6 },
    functional_weight: 0.95,
  },
  {
    id: 'node-dmn-l-pgp',
    network_system_id: CANONICAL_DMN_SYSTEM_ID,
    parcel_id: 'L_PGp',
    parcel_name: 'Posterior Angular Gyrus',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -46, y: -68, z: 32 },
    functional_weight: 0.9,
  },
];
