/**
 * @magniom/networks - Salience Network (SN) Definition
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§7, 10, 11)
 * Parcellation: HCP-MMP1.0 (Glasser et al. 2016)
 */

import type { NetworkSystem, NetworkDefinition, NetworkNode } from '@magniom/domain';

export const CANONICAL_SN_SYSTEM_ID = 's0000000-0000-4000-8000-000000000003';
export const CANONICAL_SN_DEFINITION_ID = 's0000000-0000-4000-8000-000000000013';

export const CANONICAL_SN_SYSTEM: NetworkSystem = {
  id: CANONICAL_SN_SYSTEM_ID,
  code: 'SN',
  name: 'Salience Network',
  description:
    'Cingulo-opercular system involved in detecting homeostatic and externally salient information, dynamic switching, and resource coordination between CEN and DMN.',
  definition_id: CANONICAL_SN_DEFINITION_ID,
  version: '1.0.0',
  status: 'active',
};

export const CANONICAL_SN_PARCEL_IDS: readonly string[] = [
  // Left Hemisphere
  'L_AVI',
  'L_MI',
  'L_AAIC',
  'L_FOP4',
  'L_FOP5',
  'L_a24pr',
  'L_p32pr',
  'L_a32pr',
  'L_24dd',
  'L_PF',
  // Right Hemisphere
  'R_AVI',
  'R_MI',
  'R_AAIC',
  'R_FOP4',
  'R_FOP5',
  'R_a24pr',
  'R_p32pr',
  'R_a32pr',
  'R_24dd',
  'R_PF',
];

export const CANONICAL_SN_DEFINITION: NetworkDefinition = {
  id: CANONICAL_SN_DEFINITION_ID,
  network_system_id: CANONICAL_SN_SYSTEM_ID,
  version: '1.0.0',
  atlas_id: 'ATLAS-HCP-MMP1.0',
  atlas_version: '1.0',
  parcel_ids: CANONICAL_SN_PARCEL_IDS,
  membership_method: 'Glasser_2016_Salience_MultiModal_Assignment',
  membership_parameters: {
    minimum_cortical_thickness_mm: 1.5,
    snr_threshold: 15.0,
    surface_space: 'fsLR_32k',
    parcels_count: 20,
  },
  source_evidence_claim_ids: [
    'e0000000-0000-4000-8000-000000000005',
    'e0000000-0000-4000-8000-000000000006',
  ],
  definition_hash: 'e5f393b405000571339c4405117f200993438f30260b9ed50452df2001e47203',
  effective_from: '2026-09-11T00:00:00.000Z',
  status: 'validated',
};

export const CANONICAL_SN_NODES: readonly NetworkNode[] = [
  {
    id: 'node-sn-r-avi',
    network_system_id: CANONICAL_SN_SYSTEM_ID,
    parcel_id: 'R_AVI',
    parcel_name: 'Right Anterior Ventral Insula',
    hemisphere: 'R',
    canonical_mni_coordinate: { x: 38, y: 22, z: -4 },
    functional_weight: 1.0,
  },
  {
    id: 'node-sn-l-avi',
    network_system_id: CANONICAL_SN_SYSTEM_ID,
    parcel_id: 'L_AVI',
    parcel_name: 'Left Anterior Ventral Insula',
    hemisphere: 'L',
    canonical_mni_coordinate: { x: -36, y: 20, z: -4 },
    functional_weight: 0.95,
  },
  {
    id: 'node-sn-a24pr',
    network_system_id: CANONICAL_SN_SYSTEM_ID,
    parcel_id: 'L_a24pr',
    parcel_name: 'Anterior Area 24 prime (dACC)',
    hemisphere: 'BILATERAL',
    canonical_mni_coordinate: { x: 0, y: 18, z: 32 },
    functional_weight: 0.95,
  },
];
