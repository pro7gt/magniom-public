/**
 * @magniom/networks - Central Executive Network (CEN) Definition
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§7, 8, 11)
 * Parcellation: HCP-MMP1.0 (Glasser et al. 2016)
 */

import type { NetworkSystem, NetworkDefinition, NetworkNode } from '@magniom/domain';

export const CANONICAL_CEN_SYSTEM_ID = 'c0000000-0000-4000-8000-000000000001';
export const CANONICAL_CEN_DEFINITION_ID = 'c0000000-0000-4000-8000-000000000011';

export const CANONICAL_CEN_SYSTEM: NetworkSystem = {
  id: CANONICAL_CEN_SYSTEM_ID,
  code: 'CEN',
  name: 'Central Executive Network',
  description:
    'Frontoparietal network responsible for goal-directed cognition, externally oriented attention, working memory, and cognitive flexibility.',
  definition_id: CANONICAL_CEN_DEFINITION_ID,
  version: '1.0.0',
  status: 'active',
};

export const CANONICAL_CEN_PARCEL_IDS: readonly string[] = [
  // Left Hemisphere
  'L_46',
  'L_9-46d',
  'L_8C',
  'L_a9-46v',
  'L_p9-46v',
  'L_8Av',
  'L_8Ad',
  'L_IP1',
  'L_IP2',
  'L_7Am',
  'L_AIP',
  'L_LIPd',
  'L_FEF',
  'L_TE1p',
  // Right Hemisphere
  'R_46',
  'R_9-46d',
  'R_8C',
  'R_a9-46v',
  'R_p9-46v',
  'R_8Av',
  'R_8Ad',
  'R_IP1',
  'R_IP2',
  'R_7Am',
  'R_AIP',
  'R_LIPd',
  'R_FEF',
  'R_TE1p',
];

export const CANONICAL_CEN_DEFINITION: NetworkDefinition = {
  id: CANONICAL_CEN_DEFINITION_ID,
  network_system_id: CANONICAL_CEN_SYSTEM_ID,
  version: '1.0.0',
  atlas_id: 'ATLAS-HCP-MMP1.0',
  atlas_version: '1.0',
  parcel_ids: CANONICAL_CEN_PARCEL_IDS,
  membership_method: 'Glasser_2016_FPN_MultiModal_Assignment',
  membership_parameters: {
    minimum_cortical_thickness_mm: 1.5,
    snr_threshold: 15.0,
    surface_space: 'fsLR_32k',
    parcels_count: 28,
  },
  source_evidence_claim_ids: [
    'e0000000-0000-4000-8000-000000000001',
    'e0000000-0000-4000-8000-000000000002',
  ],
  definition_hash: 'c3f191b293888350117a2283995f0ef771216d1f04ef7cb3e230bf0889c25091',
  effective_from: '2026-09-11T00:00:00.000Z',
  status: 'validated',
};

export const CANONICAL_CEN_NODES: readonly NetworkNode[] = [
  {
    id: 'node-cen-l-46',
    network_system_id: CANONICAL_CEN_SYSTEM_ID,
    parcel_id: 'L_46',
    parcel_name: 'Area 46 (DLPFC)',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -44, y: 40, z: 28 },
    functional_weight: 1.0,
  },
  {
    id: 'node-cen-l-9-46d',
    network_system_id: CANONICAL_CEN_SYSTEM_ID,
    parcel_id: 'L_9-46d',
    parcel_name: 'Area 9-46d (DLPFC)',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -42, y: 32, z: 34 },
    functional_weight: 0.95,
  },
  {
    id: 'node-cen-l-ip1',
    network_system_id: CANONICAL_CEN_SYSTEM_ID,
    parcel_id: 'L_IP1',
    parcel_name: 'Intraparietal Area 1',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -40, y: -58, z: 46 },
    functional_weight: 0.9,
  },
  {
    id: 'node-cen-r-46',
    network_system_id: CANONICAL_CEN_SYSTEM_ID,
    parcel_id: 'R_46',
    parcel_name: 'Right Area 46 (DLPFC)',
    hemisphere: 'R',
    canonical_mni_coordinate: { x: 44, y: 40, z: 28 },
    functional_weight: 0.95,
  },
];
